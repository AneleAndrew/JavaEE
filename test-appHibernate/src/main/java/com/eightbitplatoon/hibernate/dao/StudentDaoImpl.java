package com.eightbitplatoon.hibernate.dao;

import org.hibernate.Session;
import org.hibernate.SessionFactory;

import com.eightbitplatoon.hibernate.util.HibernateUtil;
import com.eightbitplatoon.hibernate.vo.StudentDetail;

public class StudentDaoImpl implements StudentDao {

	public void insertStudent(StudentDetail studentDetail ) {

		

		SessionFactory sessionFactory = HibernateUtil.getSessionFactory();
		Session session = sessionFactory.openSession();
		session.beginTransaction();

		// this would save the Student_Info object into the database
		session.save(studentDetail);
		System.out.println("Successfully saved : " + studentDetail.getRollNo());

		session.getTransaction().commit();
		session.close();
		sessionFactory.close();

	}

//	static public void main(String... args) {
//		new StudentDaoImpl().insertStudent();
//	}
}
