package hu.travelhub.travelhub.repository;

import hu.travelhub.travelhub.entity.TravelOffer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelOfferRepository extends JpaRepository<TravelOffer, Integer> {
}