package com.formwise.web;

import com.formwise.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
public class AuthController {
  private final JwtService jwt;
  private final ConcurrentHashMap<String,String> users = new ConcurrentHashMap<>();

  public AuthController(JwtService jwt) { this.jwt = jwt; }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Map<String,String> body) {
    var u = body.get("username");
    var p = body.get("password");
    if (u == null || p == null) return ResponseEntity.badRequest().body(Map.of("error","invalid"));
    if (users.putIfAbsent(u, p) != null) return ResponseEntity.badRequest().body(Map.of("error","exists"));
    return ResponseEntity.ok(Map.of("ok", true));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String,String> body) throws Exception {
    var u = body.get("username");
    var p = body.get("password");
    if (u == null || p == null) return ResponseEntity.badRequest().body(Map.of("error","invalid"));
    if (!p.equals(users.get(u))) return ResponseEntity.status(401).body(Map.of("error","bad creds"));
    return ResponseEntity.ok(Map.of(
      "accessToken", jwt.accessToken(u),
      "refreshToken", jwt.refreshToken(u)
    ));
  }

  @PostMapping("/refresh")
  public ResponseEntity<?> refresh(@RequestBody Map<String,String> body) throws Exception {
    var rt = body.get("refreshToken");
    if (rt == null) return ResponseEntity.badRequest().body(Map.of("error","invalid"));
    var claims = jwt.verify(rt);
    var sub = claims.get("sub").toString();
    return ResponseEntity.ok(Map.of(
      "accessToken", jwt.accessToken(sub)
    ));
  }
}
