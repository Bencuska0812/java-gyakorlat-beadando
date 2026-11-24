package hu.travelhub.travelhub.controller;

import hu.travelhub.travelhub.dto.ContactRequest;
import hu.travelhub.travelhub.entity.ContactMessage;
import hu.travelhub.travelhub.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageService contactMessageService;

    public ContactController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@Valid @RequestBody ContactRequest request) {
        ContactMessage savedMessage = contactMessageService.saveMessage(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedMessage);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessage>> getMessages() {
        return ResponseEntity.ok(contactMessageService.getAllMessages());
    }
}