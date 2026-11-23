package hu.travelhub.travelhub.controller;

import hu.travelhub.travelhub.dto.AuthResponse;
import hu.travelhub.travelhub.dto.RegisterRequest;
import hu.travelhub.travelhub.entity.User;
import hu.travelhub.travelhub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = new User(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    "USER"
            );

            User registeredUser = userService.registerUser(user);

            AuthResponse response = new AuthResponse(
                    registeredUser.getId(),
                    registeredUser.getUsername(),
                    registeredUser.getEmail(),
                    registeredUser.getRole(),
                    "Registration successful"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}