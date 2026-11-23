package hu.travelhub.travelhub.service;

import hu.travelhub.travelhub.entity.TravelOffer;
import hu.travelhub.travelhub.repository.TravelOfferRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TravelOfferService {

    private final TravelOfferRepository travelOfferRepository;

    public TravelOfferService(TravelOfferRepository travelOfferRepository) {
        this.travelOfferRepository = travelOfferRepository;
    }

    public List<TravelOffer> getAllOffers() {
        return travelOfferRepository.findAll();
    }

    public long getOfferCount() {
        return travelOfferRepository.count();
    }

    public TravelOffer getOfferById(Integer id) {
        return travelOfferRepository.findById(id).orElse(null);
    }

    public TravelOffer saveOffer(TravelOffer offer) {
        return travelOfferRepository.save(offer);
    }

    public void deleteOffer(Integer id) {
        travelOfferRepository.deleteById(id);
    }
}