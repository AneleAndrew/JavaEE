package com.eightbitplatoon.hibernate.vo;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

@Entity
@Table(name = "STUDENT_DETAILS")
public class StudentDetail {

	@Id
	@GeneratedValue(generator = "newGenarator")
	@GenericGenerator(name = "newGenarator", strategy = "foreign", parameters = {@Parameter(value = "student", name = "property") })
	private int rollNo;

	@Column(name = "MOBILE_NUMBER")
	private String mobileNo;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "rollNo")
	private Student student;

	public int getRollNo() {
		return rollNo;
	}

	public void setRollNo(int rollNo) {
		this.rollNo = rollNo;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public Student getStudent() {
		return student;
	}

	public void setStudent(Student student) {
		this.student = student;
	}

}
