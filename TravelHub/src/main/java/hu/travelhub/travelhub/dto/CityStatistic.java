package hu.travelhub.travelhub.dto;

public class CityStatistic {

    private String city;
    private Long value;

    public CityStatistic(String city, Long value) {
        this.city = city;
        this.value = value;
    }

    public String getCity() {
        return city;
    }

    public Long getValue() {
        return value;
    }
}