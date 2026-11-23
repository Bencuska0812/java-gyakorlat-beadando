package hu.travelhub.travelhub.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "szalloda")
public class Hotel {

    @Id
    private String az;

    private String nev;

    private Integer besorolas;

    private Integer helysegAz;

    private Integer tengerpartTav;

    private Integer repterTav;

    private Boolean felpanzio;

    public Hotel() {
    }

    public Hotel(String az, String nev, Integer besorolas, Integer helysegAz, Integer tengerpartTav, Integer repterTav, Boolean felpanzio) {
        this.az = az;
        this.nev = nev;
        this.besorolas = besorolas;
        this.helysegAz = helysegAz;
        this.tengerpartTav = tengerpartTav;
        this.repterTav = repterTav;
        this.felpanzio = felpanzio;
    }

    public String getAz() {
        return az;
    }

    public void setAz(String az) {
        this.az = az;
    }

    public String getNev() {
        return nev;
    }

    public void setNev(String nev) {
        this.nev = nev;
    }

    public Integer getBesorolas() {
        return besorolas;
    }

    public void setBesorolas(Integer besorolas) {
        this.besorolas = besorolas;
    }

    public Integer getHelysegAz() {
        return helysegAz;
    }

    public void setHelysegAz(Integer helysegAz) {
        this.helysegAz = helysegAz;
    }

    public Integer getTengerpartTav() {
        return tengerpartTav;
    }

    public void setTengerpartTav(Integer tengerpartTav) {
        this.tengerpartTav = tengerpartTav;
    }

    public Integer getRepterTav() {
        return repterTav;
    }

    public void setRepterTav(Integer repterTav) {
        this.repterTav = repterTav;
    }

    public Boolean getFelpanzio() {
        return felpanzio;
    }

    public void setFelpanzio(Boolean felpanzio) {
        this.felpanzio = felpanzio;
    }
}