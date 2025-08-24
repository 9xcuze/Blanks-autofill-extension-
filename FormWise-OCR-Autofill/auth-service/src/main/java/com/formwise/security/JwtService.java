package com.formwise.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
  @Value("${app.jwt.privateKey}") private Resource privatePem;
  @Value("${app.jwt.publicKey}") private Resource publicPem;
  @Value("${app.jwt.accessMinutes}") private long accessMinutes;
  @Value("${app.jwt.refreshDays}") private long refreshDays;

  private PrivateKey privateKey;
  private PublicKey publicKey;

  public JwtService() {}

  private static byte[] parsePem(byte[] pem, String header, String footer) throws Exception {
    String s = new String(pem, StandardCharsets.UTF_8);
    s = s.replace(header, "").replace(footer, "").replaceAll("\s", "");
    return java.util.Base64.getDecoder().decode(s);
  }

  private synchronized void ensureLoaded() throws Exception {
    if (privateKey != null && publicKey != null) return;
    var pkcs8 = parsePem(Files.readAllBytes(privatePem.getFile().toPath()),
      "-----BEGIN PRIVATE KEY-----", "-----END PRIVATE KEY-----");
    var x509 = parsePem(Files.readAllBytes(publicPem.getFile().toPath()),
      "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----");
    var kf = KeyFactory.getInstance("RSA");
    privateKey = kf.generatePrivate(new PKCS8EncodedKeySpec(pkcs8));
    publicKey = kf.generatePublic(new X509EncodedKeySpec(x509));
  }

  public String accessToken(String sub) throws Exception {
    ensureLoaded();
    Instant now = Instant.now();
    return Jwts.builder()
      .subject(sub)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plusSeconds(accessMinutes * 60)))
      .signWith(privateKey)
      .compact();
  }

  public String refreshToken(String sub) throws Exception {
    ensureLoaded();
    Instant now = Instant.now();
    return Jwts.builder()
      .subject(sub)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plusSeconds(refreshDays * 86400)))
      .signWith(privateKey)
      .compact();
  }

  public Map<String,Object> verify(String token) throws Exception {
    ensureLoaded();
    var jwt = Jwts.parser().verifyWith(publicKey).build().parseSignedClaims(token);
    return jwt.getPayload();
  }
}
