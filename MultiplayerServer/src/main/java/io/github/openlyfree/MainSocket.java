package io.github.openlyfree;

import module java.base;
import com.google.protobuf.InvalidProtocolBufferException;
import io.quarkus.websockets.next.*;

import java.sql.SQLOutput;

@WebSocket(path = "/game/{user}")
public class MainSocket {
  public static final Map<String, Connection> players = new ConcurrentHashMap<>();
  private static final Set<String> brokenBlocks = ConcurrentHashMap.newKeySet();
  private static final Map<String, int[]> playerStats = new ConcurrentHashMap<>();
  // int[]: [0]=health, [1]=kills, [2]=deaths

  @OnOpen
  void onOpen(Connection conn, @PathParam("user") String username) {
    if (players.containsKey(username)) {
      conn.close(new CloseReason(4001, "Username taken")).subscribe().with(_ -> {
      });
      return;
    }

    players.put(username, conn);
    playerStats.put(username, new int[]{100, 0, 0});

    for (String blockId : brokenBlocks)
      conn.sendBinary(GamePacket.newBuilder()
          .setBulletShot(Bullet.newBuilder().setObjectHit(blockId).build())
          .build()
          .toByteArray()).subscribe().with(_ -> {
      });

    // Send existing player stats so the newcomer sees the leaderboard
    for (var entry : playerStats.entrySet()) {
      if (entry.getKey().equals(username)) continue;
      sendStatsToOne(entry.getKey(), conn);
    }
  }

  @OnClose
  public void onClose(@PathParam("user") String username) {
    players.remove(username);
    playerStats.remove(username);
    byte[] leftPacket = GamePacket.newBuilder().setLeft(username).build().toByteArray();
    players.values().forEach(c -> c.sendBinary(leftPacket).subscribe().with(_ -> {
    }));
  }

  @OnBinaryMessage
  void onBinary(byte[] data, Connection conn, @PathParam("user") String shooter) {
    System.out.println("recieved");
    try {
      var packet = GamePacket.parseFrom(data);
      switch (packet.getPayloadCase()) {
        case PAYLOAD_NOT_SET -> {
          return;
        }
        case BULLET_SHOT -> {
          String target = packet.getBulletShot().getObjectHit();
          int damage = packet.getBulletShot().getDamage();

          int[] ts = playerStats.get(target);
          if (ts != null) {
            // Hit a player — apply damage server-side
            synchronized (ts) {
              ts[0] = Math.max(0, ts[0] - damage);

              if (ts[0] <= 0) {
                // Kill
                ts[0] = 100;
                ts[2]++;
                // Only award kill if not self-damage
                if (!shooter.equals(target)) {
                  int[] ss = playerStats.get(shooter);
                  if (ss != null) {
                    synchronized (ss) { ss[1]++; }
                  }
                  broadcastStats(shooter);
                }
              }
            }
            broadcastStats(target);
          } else {
            // Environment hit
            brokenBlocks.add(target);
          }
        }
        case PLAYER_UPDATE -> {
          // Enrich position updates with server-side stats before broadcasting
          int[] s = playerStats.get(shooter);
          if (s != null) {
            var enriched = packet.toBuilder()
                .setPlayerUpdate(packet.getPlayerUpdate().toBuilder()
                    .setHealth(s[0])
                    .setKills(s[1])
                    .setDeaths(s[2])
                    .build())
                .build();
            byte[] enrichedData = enriched.toByteArray();
            players.values().stream().filter(c -> !c.equals(conn)).forEach(c -> c.sendBinary(enrichedData).subscribe().with(_ -> {
            }));
            return;
          }
        }
      }
      // Broadcast original packet to others
      players.values().stream().filter(c -> !c.equals(conn)).forEach(c -> c.sendBinary(data).subscribe().with(_ -> {
      }));
    } catch (InvalidProtocolBufferException e) {
      System.err.println("protobuf schema mismatch");
    }
  }

  private void broadcastStats(String username) {
    int[] s = playerStats.get(username);
    if (s == null) return;
    byte[] pkt = GamePacket.newBuilder()
        .setPlayerUpdate(Player.newBuilder()
            .setUser(username)
            .setHealth(s[0])
            .setKills(s[1])
            .setDeaths(s[2])
            .build())
        .build()
        .toByteArray();
    players.values().forEach(c -> c.sendBinary(pkt).subscribe().with(_ -> {
    }));
  }

  private void sendStatsToOne(String username, Connection conn) {
    int[] s = playerStats.get(username);
    if (s == null) return;
    byte[] pkt = GamePacket.newBuilder()
        .setPlayerUpdate(Player.newBuilder()
            .setUser(username)
            .setHealth(s[0])
            .setKills(s[1])
            .setDeaths(s[2])
            .build())
        .build()
        .toByteArray();
    conn.sendBinary(pkt).subscribe().with(_ -> {
    });
  }
}