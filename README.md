# CloudNotes

### Application Link: [https://www.cloudnotes.link/](https://www.cloudnotes.link/)

### Backend Documentation Link: [https://docs.cloudnotes.link/](https://docs.cloudnotes.link/)

### Project Demo Link: [https://clipchamp.com/watch/TJBVqcPZEYF](https://clipchamp.com/watch/TJBVqcPZEYF)

# Requirements of Application

Our proposed cloud application to meet the coursework requirement for this module is a cloud-based note-taking application built by implementing AWS technology. This web application will allow users to log in and save notes that users have taken using a rich-text editor. The notes will automatically save to the cloud, so users don’t have to worry about saving their work. Users will be able to add multiple tags to their notes to organise their work. If a user deletes their note, they will be able to retrieve it from their trash; else, the note will be permanently deleted after 30 days. Users will also be able to generate a shareable link (which they can enable & disable) that they can use to share a note they take with others.

# Typical Users

This web application is aimed towards users who prefer to keep their notes in the cloud, accessible on multiple devices connected to the internet instead of a single device. This would also ensure that no notes are lost if the device were to fail since everything is stored in a database in the cloud. One feature that might attract other users is the tag organisation system. This allows users to organise their notes by adding and removing tags that act similarly to folders for the notes but with more flexibility since one note can have multiple tags. This allows for more freedom for the user to organise their notes as they think most useful, also prevents replication of notes in the database.
Another feature that would attract users is making a note shareable via a generated link, allowing them to share a note they have created with anyone through the web. They will also have the ability to disable and enable the link, making the note private and public as they see fit.

# Implementation

This cloud-based web application will be built using AWS infrastructure, utilising a lot of the Platform as a Service (PaaS) services offered. It will be a serverless application and will be able to scale out automatically to meet user demands.

The backend will be powered by AWS Lambda functions that are written in Python, making it a serverless application. Lambda is a managed AWS service, every time a function is called AWS increases the number of concurrent executions of the functions being called, allowing it to be scalable. The API endpoints will be created and managed using API Gateway. This is another AWS-managed service that allows for the creation of API endpoints. Each endpoint will be piped to the appropriate Lambda function to handle the requests and data being served from the front end. The Lambda functions will utilize an AWS-managed MySQL database through AWS RDS to save notes and other data to the appropriate tables. AWS RDS allows for access to a relational database without needing to create a VM, as well as scale to meet user demand. For login and authentication, we will be using Auth0, which is a third-party service that abstracts the login and sign-up process.

The frontend will be built using the Javascript framework, ReactJS. For the application's design system we will use Ant Design components. These static files will be served to users by utilising the static hosting feature of an AWS S3 Bucket. AWS S3 is a cloud object storage service that is highly reliable and scalable. Amazon Route 53 (AWS DNS service) will be used to handle redirecting users to the S3 bucket that is hosting our frontend application when they type in the domain of our app in their browser.

# Amendments to Application

In terms of the backend architecture, the only changed we made that is different than the proposal is the addition of the AWS CloudFront (CDN) Service. It will ensure the content for the website is delivered quickly to our consumers and certain static elements are cached closed to their locations once the first request has been made.

There is also a change to the MySQL database schema due to Auth0 handling all of the user authentication and providing each user with it's own unique `sub` id (which is also authorized and validated every time an endpoint is called for security purposes). Instead of having an individual user table we use this `sub` id as the main `user_id` variable in the `Note` and `Tag` tables. We also make use of the PyMySql python library to help handle executing SQL queries.

Other than those changes the application works well and meets the goals we set in the beginning of this coursework project. Login and test it out [here](https://www.cloudnotes.link/).
