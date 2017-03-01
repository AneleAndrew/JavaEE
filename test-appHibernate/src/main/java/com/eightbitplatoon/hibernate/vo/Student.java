package com.eightbitplatoon.hibernate.vo;

import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "STUDENT_INFORMATION")
public class Student {

	@Id
	@GeneratedValue
	private int rollNo;
	@Column(name = "FULL_NAME")
	private String name;
	@Temporal(TemporalType.DATE)
	@Column(name = "DATE_OF_BIRTH")
	private Date birthDay;

	@ManyToOne(cascade = CascadeType.ALL)
	StuAddress stuadress;

	public int getRollNo() {
		return rollNo;
	}

	public void setRollNo(int rollNo) {
		this.rollNo = rollNo;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getBirthDay() {
		return birthDay;
	}

	public void setBirthDay(Date birthDay) {
		this.birthDay = birthDay;
	}

	public StuAddress getStuadress() {
		return stuadress;
	}

	public void setStuadress(StuAddress stuadress) {
		this.stuadress = stuadress;
	}

}
