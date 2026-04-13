package com.group.smartcampus.demo.service;

import com.group.smartcampus.demo.dto.UserRequestDto;
import com.group.smartcampus.demo.dto.UserResponseDto;
import com.group.smartcampus.demo.model.User;
import com.group.smartcampus.demo.model.UserRole;
import com.group.smartcampus.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDto createUser(UserRequestDto dto) {
        User user = new User();
        user.setGoogleId(dto.getGoogleId());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        if (dto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return mapToResponseDto(saved);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public List<UserResponseDto> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponseDto(user);
    }

    public UserResponseDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return mapToResponseDto(user);
    }

    public UserResponseDto updateUser(String id, UserRequestDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        
        User updated = userRepository.save(user);
        return mapToResponseDto(updated);
    }

    public UserResponseDto updateUserRole(String id, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        User updated = userRepository.save(user);
        return mapToResponseDto(updated);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserResponseDto mapToResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setGoogleId(user.getGoogleId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
