package hu.travelhub.travelhub.service;

import hu.travelhub.travelhub.entity.Hotel;
import hu.travelhub.travelhub.repository.HotelRepository;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;

    public HotelService(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public long getHotelCount() {
        return hotelRepository.count();
    }

    public Hotel getHotelById(String id) {
        return hotelRepository.findById(id).orElse(null);
    }

    public Hotel saveHotel(Hotel hotel) {
        if (hotel.getAz() == null || hotel.getAz().isBlank()) {
            BigInteger nextId = hotelRepository.findAll().stream()
                    .map(Hotel::getAz)
                    .filter(id -> id != null && id.matches("\\d+"))
                    .map(BigInteger::new)
                    .max(BigInteger::compareTo)
                    .orElse(BigInteger.ZERO)
                    .add(BigInteger.ONE);
            hotel.setAz(nextId.toString());
        }

        return hotelRepository.save(hotel);
    }

    public void deleteHotel(String id) {
        hotelRepository.deleteById(id);
    }
}