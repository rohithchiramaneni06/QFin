package com.portfolio_optimizer_backend.portfolioOptimizer.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.sendgrid.helpers.mail.objects.Content;

import java.io.IOException;

@Service
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;
    
    @Value("${sendgrid.from.email}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) throws IOException {
        Email from = new Email(fromEmail); // Use configured sender email
        String subject = "Your OTP Code";
        Email to = new Email(toEmail);
        Content content = new Content("text/plain", "Your OTP is: " + otp);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            System.out.println("Email sent: " + response.getStatusCode());
            System.out.println("Response body: " + response.getBody());

        } catch (IOException ex) {
            System.err.println("Failed to send email: " + ex.getMessage());
            throw ex;
        }
    }
}
