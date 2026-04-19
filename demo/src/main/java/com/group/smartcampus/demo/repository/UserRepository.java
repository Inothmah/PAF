package com.group.smartcampus.demo.repository;

import com.group.smartcampus.demo.model.User;
import com.group.smartcampus.demo.model.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
}
