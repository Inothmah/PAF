package com.group.smartcampus.demo.controller;

import com.group.smartcampus.demo.config.JwtUtil;
import com.group.smartcampus.demo.dto.AuthResponseDto;
import com.group.smartcampus.demo.dto.LoginRequestDto;
import com.group.smartcampus.demo.dto.UserRequestDto;
import com.group.smartcampus.demo.dto.UserResponseDto;
import com.group.smartcampus.demo.model.User;
import com.group.smartcampus.demo.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> authenticateUser(@Valid @RequestBody LoginRequestDto loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AuthResponseDto response = new AuthResponseDto();
        response.setToken(jwt);
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> registerUser(@Valid @RequestBody UserRequestDto signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(null);
        }

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole() != null ? signUpRequest.getRole() : com.group.smartcampus.demo.model.UserRole.USER);

        User savedUser = userRepository.save(user);

        String jwt = jwtUtil.generateToken(savedUser.getEmail());

        AuthResponseDto response = new AuthResponseDto();
        response.setToken(jwt);
        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setName(savedUser.getName());
        response.setRole(savedUser.getRole());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    @PostMapping("/google")
    public ResponseEntity<AuthResponseDto> googleLogin(@Valid @RequestBody com.group.smartcampus.demo.dto.GoogleLoginRequestDto googleLoginRequest) {
        try {
            // 1. Verify Google ID Token
            // NOTE: Replace with your actual Client ID in production
            String clientId = "725531195011-op07cuk8v9qfaoqiik99g749o0t91jqs.apps.googleusercontent.com";
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = 
                new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(), 
                    new com.google.api.client.json.gson.GsonFactory())
                .setAudience(java.util.Collections.singletonList(clientId))
                .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(googleLoginRequest.getIdToken());
            
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // 2. Extract User Info
            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            // 3. Find or Create User
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setRole(com.group.smartcampus.demo.model.UserRole.USER);
                // For Google users, we can set a dummy password or leave it null if the system allows
                newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                return userRepository.save(newUser);
            });

            // 4. Generate Local JWT
            String jwt = jwtUtil.generateToken(user.getEmail());

            AuthResponseDto response = new AuthResponseDto();
            response.setToken(jwt);
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setName(user.getName());
            response.setRole(user.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
