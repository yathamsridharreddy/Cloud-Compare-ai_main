package com.cloudcompare.ai.controller;

import com.cloudcompare.ai.dto.LoginRequest;
import com.cloudcompare.ai.dto.SignupRequest;
import com.cloudcompare.ai.entity.UserEntity;
import com.cloudcompare.ai.repository.UserRepository;
import com.cloudcompare.ai.security.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        logger.info("📝 Processing elite signup for: {}", signupRequest.getEmail());
        authService.registerUser(signupRequest);
        return ResponseEntity.ok(Map.of("message", "User synchronization successful. Identity established."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("🔐 Login request received for email: {}", loginRequest.getEmail());
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);

            UserEntity user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();
            
            logger.info("✅ Login successful for: {}", loginRequest.getEmail());
            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "name", user.getName(),
                    "email", user.getEmail()
            ));
        } catch (Exception e) {
            logger.error("❌ Login failed: ", e);
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }
}
