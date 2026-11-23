package hu.travelhub.travelhub.service;

import hu.travelhub.travelhub.entity.City;
import hu.travelhub.travelhub.repository.CityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CityService {

    private final CityRepository cityRepository;

    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    public long getCityCount() {
        return cityRepository.count();
    }

    public City getCityById(Integer id) {
        return cityRepository.findById(id).orElse(null);
    }

    public City saveCity(City city) {
        return cityRepository.save(city);
    }

    public void deleteCity(Integer id) {
        cityRepository.deleteById(id);
    }
}