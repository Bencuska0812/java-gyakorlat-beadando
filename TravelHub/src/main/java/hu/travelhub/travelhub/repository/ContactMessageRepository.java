package hu.travelhub.travelhub.repository;

import hu.travelhub.travelhub.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Integer> {

    List<ContactMessage> findAllByOrderByCreatedAtDesc();
}