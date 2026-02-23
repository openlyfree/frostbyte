using System;
using System.Collections.Generic;
using Google.Protobuf;
using Io.Github.Openlyfree;
using NativeWebSocket;
using UnityEngine;
using Random = UnityEngine.Random;
using Vector3 = UnityEngine.Vector3;

public class NetworkManager : MonoBehaviour
{
    public class PlayerStats
    {
        public uint health = 100;
        public uint kills;
        public uint deaths;
    }


    public event System.Action<string> OnKillFeedMessage;

    private WebSocket _ws;
    [SerializeField] private GameObject playerPrefab;
    public string _username;
    public Dictionary<string, GameObject> others = new Dictionary<string, GameObject>();
    public Dictionary<string, PlayerStats> playerStats = new Dictionary<string, PlayerStats>();
    public uint currentWeaponId; // 0=ak, 1=pistol — set by GunController
    public string server;

    async void Start()
    {
        for (int i = 0; i < 5; i++)
            _username += "ABCDEFGHIJKLMNOP"[Random.Range(0, 26)];
        server = "f129-206-206-222-123.ngrok-free.app";
        _ws = new WebSocket("wss://" + server + "/game/" + _username);

        _ws.OnMessage += OnMessage;
        _ws.OnOpen += () => Debug.Log("Connected to Server");
        _ws.OnError += e => Debug.LogError("WebSocket error: " + e);
        _ws.OnClose += code => Debug.Log("WebSocket closed: " + code);

        playerStats[_username] = new PlayerStats();

        await _ws.Connect();
    }

    void Update()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        _ws.DispatchMessageQueue();
#endif
    }

    private void OnMessage(byte[] bytes)
    {
        var pktrx = GamePacket.Parser.ParseFrom(bytes);
        switch (pktrx.PayloadCase)
        {
            case GamePacket.PayloadOneofCase.None: return;
            case GamePacket.PayloadOneofCase.PlayerUpdate: HandlePlayerUpdate(pktrx); break;
            case GamePacket.PayloadOneofCase.BulletShot: HandleBulletShot(pktrx); break;
            case GamePacket.PayloadOneofCase.Left: HandlePlayerLeft(pktrx); break;
            default: throw new ArgumentOutOfRangeException();
        }
    }

    private void HandlePlayerUpdate(GamePacket pkt)
    {
        var plyr = pkt.PlayerUpdate;

        // Always update stats
        if (!playerStats.ContainsKey(plyr.User))
            playerStats[plyr.User] = new PlayerStats();

        uint prevHealth = playerStats[plyr.User].health;
        uint prevDeaths = playerStats[plyr.User].deaths;
        playerStats[plyr.User].health = plyr.Health;
        playerStats[plyr.User].kills = plyr.Kills;
        playerStats[plyr.User].deaths = plyr.Deaths;

        // Detect death — broadcast kill feed message
        if (plyr.Deaths > prevDeaths)
        {
            // Health reset to 100 means they just respawned
            OnKillFeedMessage?.Invoke(plyr.User + " died");
        }

        // Flash red on damage
        if (plyr.Health < prevHealth && others.ContainsKey(plyr.User))
        {
            var flash = others[plyr.User].GetComponent<HitFlash>();
            if (flash == null) flash = others[plyr.User].AddComponent<HitFlash>();
            flash.Flash();
        }

        // Don't move our own player from server updates
        if (plyr.User == _username) return;

        // Only update position if pos data is present (stats-only updates have zeroed pos)
        if (plyr.Pos != null && (plyr.Pos.X != 0 || plyr.Pos.Y != 0 || plyr.Pos.Z != 0))
        {
            var pos = VecFromProtoVec(plyr.Pos);
            var rot = VecFromProtoVec(plyr.Rot);
            if (others.ContainsKey(plyr.User))
            {
                others[plyr.User].transform.position = pos;
                others[plyr.User].transform.rotation = Quaternion.Euler(rot);
            }
            else
            {
                var obj = Instantiate(playerPrefab, pos, Quaternion.Euler(rot));
                obj.name = plyr.User;
                var label = obj.transform.Find("user");
                if (label != null) label.GetComponent<TMPro.TextMeshPro>().text = plyr.User;
                others[plyr.User] = obj;
            }

            // Sync animation state
            uint moveAnim = plyr.Anim & 0xFF;
            uint weaponId = plyr.Anim >> 8;
            var animator = others[plyr.User].GetComponentInChildren<Animator>();
            if (animator != null)
            {
                animator.SetBool("isWalking", moveAnim == 1 || moveAnim == 2);
                animator.SetBool("isSprinting", moveAnim == 2);
                animator.SetBool("isCrouching", moveAnim == 3);
                animator.SetBool("isAirborne", moveAnim == 4);
            }

            // Sync weapon visuals
            var gun = others[plyr.User].GetComponentInChildren<GunController>();
            if (gun != null)
            {
                gun.SetWeaponRemote(weaponId);
            }
        }
    }

    private void HandlePlayerLeft(GamePacket pkt)
    {
        if (!others.ContainsKey(pkt.Left)) return;
        if (others[pkt.Left] != null) Destroy(others[pkt.Left]);
        others.Remove(pkt.Left);
        playerStats.Remove(pkt.Left);
    }

    private void HandleBulletShot(GamePacket pkt)
    {
        string hitName = pkt.BulletShot.ObjectHit;
        if (others.ContainsKey(hitName) || hitName == _username) return;
        var objhit = GameObject.Find(hitName);
        if (objhit != null) Destroy(objhit);
    }

    public Vector3 VecFromProtoVec(Io.Github.Openlyfree.Vector3 v) => new Vector3(v.X, v.Y, v.Z);

    public Io.Github.Openlyfree.Vector3 ProtoVecFromVec(Vector3 v) =>
        new Io.Github.Openlyfree.Vector3() { X = v.x, Y = v.y, Z = v.z };

    public void SendPlayerUpdate(Vector3 pos, Vector3 rot, uint anim = 0)
    {
        _ws.Send(new GamePacket()
        {
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            PlayerUpdate = new Player()
            {
                User = _username,
                Pos = ProtoVecFromVec(pos),
                Rot = ProtoVecFromVec(rot),
                Anim = anim | (currentWeaponId << 8),
            }
        }.ToByteArray());
    }


    public void SendBulletShot(String objHitName, int damage)
    {
        if (_ws == null || _ws.State != WebSocketState.Open) return;
        _ws.Send(new GamePacket()
        {
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            BulletShot = new Bullet()
            {
                By = _username,
                Damage = (uint)damage,
                ObjectHit = objHitName
            }
        }.ToByteArray());
    }


    private void OnApplicationQuit()
    {
        if (_ws != null) _ws.Close();
    }
}