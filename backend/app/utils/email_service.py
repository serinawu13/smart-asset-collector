"""
Email Service

Handles sending email notifications for price alerts.
"""

import logging
from typing import Optional
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email notifications"""
    
    def __init__(self):
        """Initialize email service with SMTP configuration"""
        # These would typically come from environment variables
        self.smtp_host = getattr(settings, 'smtp_host', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'smtp_port', 587)
        self.smtp_user = getattr(settings, 'smtp_user', None)
        self.smtp_password = getattr(settings, 'smtp_password', None)
        self.from_email = getattr(settings, 'from_email', 'noreply@smartassetcollector.com')
        self.enabled = self.smtp_user is not None and self.smtp_password is not None
        
        if not self.enabled:
            logger.warning("Email service not configured. Email notifications will be logged but not sent.")
    
    async def send_price_alert_email(
        self,
        to_email: str,
        user_name: str,
        item_brand: str,
        item_model: str,
        alert_condition: str,
        target_price: Optional[float],
        current_price: float,
        currency: str = "USD"
    ) -> bool:
        """
        Send a price alert email notification.
        
        Args:
            to_email: Recipient email address
            user_name: User's name
            item_brand: Brand of the item
            item_model: Model of the item
            alert_condition: Condition that triggered the alert (above/below/etc.)
            target_price: Target price set by user
            current_price: Current market price
            currency: Currency code
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Format prices
            if target_price:
                target_str = f"{currency} {target_price:,.2f}"
            else:
                target_str = "N/A"
            current_str = f"{currency} {current_price:,.2f}"
            
            # Create email subject
            subject = f"🔔 Price Alert: {item_brand} {item_model}"
            
            # Create email body
            condition_text = {
                "above": f"has gone above your target price of {target_str}",
                "below": f"has dropped below your target price of {target_str}",
                "percentage_up": "has increased significantly",
                "percentage_down": "has decreased significantly"
            }.get(alert_condition, "has met your alert condition")
            
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2563eb;">Price Alert Triggered</h2>
                        <p>Hi {user_name},</p>
                        <p>Your price alert for <strong>{item_brand} {item_model}</strong> has been triggered!</p>
                        
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Item:</strong> {item_brand} {item_model}</p>
                            <p style="margin: 5px 0;"><strong>Current Price:</strong> {current_str}</p>
                            <p style="margin: 5px 0;"><strong>Target Price:</strong> {target_str}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> The price {condition_text}</p>
                        </div>
                        
                        <p>Log in to your Smart Asset Collector account to view more details and manage your alerts.</p>
                        
                        <p style="margin-top: 30px; font-size: 12px; color: #666;">
                            This is an automated notification from Smart Asset Collector. 
                            You can manage your notification preferences in your account settings.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            text_body = f"""
Price Alert Triggered

Hi {user_name},

Your price alert for {item_brand} {item_model} has been triggered!

Item: {item_brand} {item_model}
Current Price: {current_str}
Target Price: {target_str}
Status: The price {condition_text}

Log in to your Smart Asset Collector account to view more details and manage your alerts.

---
This is an automated notification from Smart Asset Collector.
You can manage your notification preferences in your account settings.
            """
            
            # Send email
            return await self._send_email(to_email, subject, html_body, text_body)
            
        except Exception as e:
            logger.error(f"Error sending price alert email to {to_email}: {e}")
            return False
    
    async def _send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: str
    ) -> bool:
        """
        Internal method to send email via SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML version of email body
            text_body: Plain text version of email body
            
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.enabled:
            logger.info(f"[EMAIL SIMULATION] Would send email to {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {text_body[:200]}...")
            return True
        
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = self.from_email
            message['To'] = to_email
            message['Date'] = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')
            
            # Attach both plain text and HTML versions
            part1 = MIMEText(text_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            message.attach(part1)
            message.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False


# Global email service instance
email_service = EmailService()
