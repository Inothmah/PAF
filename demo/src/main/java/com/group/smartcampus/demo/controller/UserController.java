package com.group.smartcampus.demo.controller;

import com.group.smartcampus.demo.dto.UserRequestDto;
import com.group.smartcampus.demo.dto.UserResponseDto;
import com.group.smartcampus.demo.model.UserRole;
import com.group.smartcampus.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // GET /api/me - Assuming a mock user for now as OAuth is not fully set up
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMe(@RequestHeader(value = "X-User-Email", required = false, defaultValue = "user@demo.com") String email) {
        try {
            return ResponseEntity.ok(userService.getUserByEmail(email));
        } catch (Exception e) {
            // If user doesn't exist, create a mock one for demo purposes
            UserRequestDto mockDto = new UserRequestDto();
            mockDto.setEmail(email);
            mockDto.setName("Demo User");
            mockDto.setGoogleId("mock-google-id");
            mockDto.setRole(UserRole.USER);
            return new ResponseEntity<>(userService.createUser(mockDto), HttpStatus.CREATED);
        }
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDto>> getTechnicians() {
        return ResponseEntity.ok(userService.getUsersByRole(UserRole.TECHNICIAN));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> create(@RequestBody UserRequestDto dto) {
        return new ResponseEntity<>(userService.createUser(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserResponseDto> update(@PathVariable String id, @RequestBody UserRequestDto dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponseDto> updateRole(@PathVariable String id, @RequestBody UserRole role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
