package com.cloudcompare.ai.service;

import com.cloudcompare.ai.dto.SignupRequest;
import com.cloudcompare.ai.entity.UserEntity;
import com.cloudcompare.ai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Pattern PASSWORD_PATTERN = Pattern
            .compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$");

    @Transactional
    public UserEntity registerUser(SignupRequest signupRequest) {
        // Elite Backend Validation
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new com.cloudcompare.ai.exception.BusinessException("Oops! You already have an account.\nSign in to continue.");
        }

        if (!PASSWORD_PATTERN.matcher(signupRequest.getPassword()).matches()) {
            throw new RuntimeException(
                    "SECURITY ALERT: Password does not meet the vault-grade complexity requirements.");
        }

        UserEntity user = new UserEntity();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        return userRepository.save(user);
    }
}
