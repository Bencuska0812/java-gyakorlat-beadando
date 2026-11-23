package hu.travelhub.travelhub.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "helyseg")
public class City {

    @Id
    private Integer az;

    private String nev;

    private String orszag;

    public City() {
    }

    public City(Integer az, String nev, String orszag) {
        this.az = az;
        this.nev = nev;
        this.orszag = orszag;
    }

    public Integer getAz() {
        return az;
    }

    public void setAz(Integer az) {
        this.az = az;
    }

    public String getNev() {
        return nev;
    }

    public void setNev(String nev) {
        this.nev = nev;
    }

    public String getOrszag() {
        return orszag;
    }

    public void setOrszag(String orszag) {
        this.orszag = orszag;
    }
}