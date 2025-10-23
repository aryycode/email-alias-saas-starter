# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a new user first arrives, they land on the public page of the app, which explains the email alias service and invites them to create an account. They click the “Sign Up” button and are taken to a simple form where they enter their email address and choose a password. After filling in those details and hitting “Create Account,” they receive a confirmation email to verify their address. Once they confirm, they return to the app and sign in. If the user already has an account, they click “Sign In,” enter their credentials, and gain access. If they forget their password, they click “Forgot Password,” enter their registered email, and receive a reset link. They follow that link to set a new password and then sign in normally. To log out at any time, they use the “Sign Out” link in the user menu.

## Main Dashboard or Home Page

After signing in, the user lands on the dashboard home page. At the top, they see the app title and a theme toggle switch for light or dark mode. On the left side, a vertical navigation panel shows links to the Domains page and the Inbox page. The main area welcomes the user by name and shows summary widgets: the number of active domains, total email aliases, and unread emails. The user menu in the header offers links to Settings and Sign Out. From this dashboard, the user can click “Domains” to manage their custom domains or click “Inbox” to view received messages.

## Detailed Feature Flows and Page Transitions

When the user clicks “Domains,” they reach the Domains page. Here they see a table of domains they have added, each labeled as Pending or Verified. To add a new domain, they click “Add Domain,” fill in the domain name, and submit. The app then displays DNS records that the user must create with their DNS provider. When the records are in place, the user returns and clicks “Verify.” The app checks the DNS TXT records and updates the domain status. If verification succeeds, the status changes to Verified, and the domain becomes available for email aliasing.

To set up email aliases, the user navigates to the Aliases section on the Domains page. For each verified domain, they can add new alias names. They enter the alias prefix and link it to an existing inbox or forwarding address. Once saved, the alias appears in the list and can receive inbound mail.

When the user selects “Inbox,” they see a two-column layout. On the left, a scrollable list shows each message’s sender, subject, and timestamp. Unread messages are highlighted. When the user clicks a message, the right panel displays the full content. The email body renders safely inside a sandboxed frame or sanitized section, and any attachments are listed below with download links. The user can mark the message as read or unread by clicking an icon in the message header.

Behind the scenes, inbound email arrives via a Cloudflare Worker that forwards it to the app’s webhook endpoint. The webhook verifies a secret key, parses the email, looks up the matching user by their alias or domain, and inserts the message into the database. Attachments are uploaded to object storage, and references are saved in the attachments table. After processing, the app returns a confirmation status to the worker.

## Settings and Account Management

In the Settings page, the user can update their personal profile information, including full name and contact email. They also see a section for password change, where they enter their current password and choose a new one. A theme preference switch allows toggling between light and dark mode and stores that choice in local storage so the app remembers it on future visits. If the user wants to delete their account, they click “Delete Account,” confirm the action, and the app removes their data and returns them to the public landing page.

## Error States and Alternate Paths

If the user enters an invalid domain or alias name when adding a domain, the form returns an error message explaining what needs to be corrected. During DNS verification, if the expected DNS record is not found, the app shows a clear message that the record is missing or misconfigured and invites the user to retry. On the Inbox page, if the connection to the server fails, an error banner appears at the top with a retry button. When the webhook receives an email with an invalid secret key, it rejects the request with an unauthorized status. If a database error occurs while saving messages or attachments, the webhook returns a server error and logs the details for debugging.

## Conclusion and Overall App Journey

From the moment a user signs up to the time they manage domains and read emails, the app guides them with clear pages and flows. They land on a friendly dashboard where they can add and verify domains, set up aliases, and monitor incoming messages in a modern inbox interface. They can adjust their account settings, recover lost passwords, and switch themes. Error messages help them correct mistakes or retry actions. Overall, the journey leads the user smoothly from sign-up to everyday use, empowering them to manage email aliases and view messages with confidence.