package com.eightbitplatoon.hibernate;

import java.util.Date;

import org.junit.Test;

import com.eightbitplatoon.hibernate.dao.StudentDaoImpl;
import com.eightbitplatoon.hibernate.vo.StudentDetail;
import com.eightbitplatoon.hibernate.vo.StuAddress;
import com.eightbitplatoon.hibernate.vo.Student;

public class StudentTest {

	StudentDaoImpl stu = new StudentDaoImpl();

	@Test
	public void testInsertStudent() {
		
		
		StuAddress stua = new StuAddress();
		stua.setAddressDetail("South Africa");

		Student student = new Student();
		student.setName("Anele Andrew");
		student.setBirthDay(new Date());
		student.setStuadress(stua);
		
		StudentDetail studentDetail = new StudentDetail();
		studentDetail.setMobileNo("0839999518");
		studentDetail.setStudent(student);
		stu.insertStudent(studentDetail);

		junit.framework.TestCase.assertEquals("Anele Andrew", student.getName());
	}

}
