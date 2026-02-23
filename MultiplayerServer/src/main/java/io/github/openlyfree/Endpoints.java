package io.github.openlyfree;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestResponse;

@Path("/")
public class Endpoints {

  @GET
  @Path("/{user}")
  @Produces(MediaType.TEXT_PLAIN)
  public RestResponse<String> userAvailCheck(@PathParam("user") String user) {
    if (!MainSocket.players.containsKey(user)) {
      return RestResponse.ok("Hello, World!");
    }
    return RestResponse.status(Response.Status.BAD_REQUEST, "no");
  }

  @Path("/getSeed")
  @GET
  public String getSeed() {
    return String.valueOf(System.currentTimeMillis());
  }

}
