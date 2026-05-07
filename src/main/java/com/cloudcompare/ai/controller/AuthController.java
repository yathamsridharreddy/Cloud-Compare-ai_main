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
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            logger.info("📝 Signup request received for email: {}", signupRequest.getEmail());
            
            if (userRepository.existsByEmail(signupRequest.getEmail())) {
                logger.warn("⚠️ Email already exists: {}", signupRequest.getEmail());
                return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use!"));
            }

            UserEntity user = new UserEntity();
            user.setName(signupRequest.getName());
            user.setEmail(signupRequest.getEmail());
            user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

            logger.info("💾 Saving user to database: {}", user.getEmail());
            UserEntity savedUser = userRepository.save(user);
            logger.info("✅ User saved successfully with ID: {}", savedUser.getId());
            
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));
        } catch (Exception e) {
            logger.error("❌ Error during signup: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Signup failed: " + e.getMessage()));
        }
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
