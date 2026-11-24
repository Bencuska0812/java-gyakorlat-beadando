package hu.travelhub.travelhub.service;

import hu.travelhub.travelhub.dto.ContactRequest;
import hu.travelhub.travelhub.entity.ContactMessage;
import hu.travelhub.travelhub.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    public ContactMessage saveMessage(ContactRequest request) {
        ContactMessage contactMessage = new ContactMessage(
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage()
        );

        return contactMessageRepository.save(contactMessage);
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }
}