/**
 * Smart Review System - Updated Build Script
 * Generates a single smart_rev.html file with embedded CSS, JS, and data
 * Also creates generated_review_links.txt with collection page URLs
 * And generates QR codes for each location
 * 
 * Usage: node smart_rev_build.js
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Function to check and install dependencies
async function ensureDependencies() {
  console.log('Checking dependencies...');
  
  try {
    // Check if package.json exists
    if (!existsSync('package.json')) {
      console.log('Creating package.json...');
      writeFileSync('package.json', JSON.stringify({
        "name": "smart-review-builder",
        "version": "1.0.0",
        "private": true,
        "type": "module",
        "dependencies": {
          "qrcode": "^1.5.3"
        }
      }, null, 2));
    }

    // Check if node_modules exists
    if (!existsSync('node_modules')) {
      console.log('Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }

    // Try to import qrcode to verify installation
    const QRCode = await import('qrcode');
    console.log('Dependencies are ready!');
    return QRCode;
  } catch (error) {
    console.error('Error setting up dependencies:', error);
    process.exit(1);
  }
}

// Main function
async function buildFiles() {
  console.log('Smart Review Data Generator');
  console.log('--------------------------\n');

  // Ensure dependencies are installed first
  const QRCode = await ensureDependencies();

  // Check if 2_enter_location_details_here.txt exists
  if (!existsSync('2_enter_location_details_here.txt')) {
    console.error('Error: 2_enter_location_details_here.txt file not found!');
    console.log('Please create this file with the required format:');
    console.log('1st line: Domain:{your domain}');
    console.log('2nd line: whatsapp:{link to whatsapp chat}');
    console.log('Location format: {locationname},{googlereviewlink}');
    return;
  }

  // Read location details file
  const fileContent = readFileSync('2_enter_location_details_here.txt', 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    console.error('Error: 2_enter_location_details_here.txt file has insufficient data!');
    return;
  }

  // Parse Domain (first line)
  const domainLine = lines[0].trim();
  if (!domainLine.startsWith('Domain:')) {
    console.error('Error: First line must start with "Domain:"');
    return;
  }
  const domain = domainLine.substring('Domain:'.length).trim();
  
  // Parse WhatsApp (second line)
  const whatsappLine = lines[1].trim();
  if (!whatsappLine.startsWith('whatsapp:')) {
    console.error('Error: Second line must start with "whatsapp:"');
    return;
  }
  const whatsappLink = whatsappLine.substring('whatsapp:'.length).trim();

  // Parse locations (remaining lines)
  const locations = [];
  const reviewLinks = [];
  for (let i = 2; i < lines.length; i++) {
    const entry = lines[i].trim();
    if (entry === '') continue;
    const parts = entry.split('|');
    if (parts.length !== 2) {
      console.error(`Error in location entry ${i-1}: "${entry}"`);
      continue;
    }
    const id = (i - 1).toString();
    locations.push({
      name: parts[0].trim(),
      id: id,
      url: parts[1].trim()
    });
    const collectionUrl = `${domain}/smart_rev.html?loc=${id}`;
    reviewLinks.push(`${parts[0].trim()}: ${collectionUrl}`);
  }
  
  if (locations.length === 0) {
    console.error('Error: No valid locations found in the file!');
    return;
  }

  // CSS content
  const cssContent = `body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f5f5f5;
  padding: 20px;
  overflow: hidden;
  box-sizing: border-box;
}

.sr-container {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 500px;
  width: min(95%, 500px);
  margin: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow: hidden;
}

#sr-location-name {
  margin: 20px 0 15px 0;
  font-size: 24px;
}

#sr-stars {
  transition: all 1s ease-out;
  margin: 10px 0;
}

#sr-stars.fade-out {
  transform: scale(0.8);
  opacity: 0.3;
}

#sr-stars.fade-out-complaint {
  transform: scale(0.85);
  opacity: 0.4;
}

#sr-stars span {
  font-size: 35px;
  cursor: pointer;
  color: #ccc;
  margin: 0 3px;
  transition: all 1s ease-out;
}

#sr-stars span.sr-selected {
  color: gold;
}

.sr-container button {
  margin-top: 15px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

#sr-actions {
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes textboxGlow {
  0% {
    box-shadow: 0 0 5px rgba(37, 211, 102, 0.2);
  }
  50% {
    box-shadow: 0 0 15px rgba(37, 211, 102, 0.4);
  }
  100% {
    box-shadow: 0 0 5px rgba(37, 211, 102, 0.2);
  }
}

#sr-complaint {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  margin: 10px 0;
  resize: vertical;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.5s ease-out;
  opacity: 0;
  transform: translateY(-10px);
  animation: textboxGlow 2s infinite;
  min-height: 80px;
  max-height: 300px;
  box-sizing: border-box;
}

#sr-complaint.show {
  opacity: 1;
  transform: translateY(0);
}

#sr-complaint:focus {
  border-color: #25d366;
  outline: none;
  box-shadow: 0 2px 8px rgba(37, 211, 102, 0.2);
  animation: none;
}

@keyframes whatsappPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(37, 211, 102, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
  }
}

button.sr-whatsapp {
  background-color: #25d366;
  color: white;
  font-size: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.5s ease-out;
  opacity: 0;
  transform: translateY(-10px);
  animation: whatsappPulse 2s infinite;
}

button.sr-whatsapp.show {
  opacity: 1;
  transform: translateY(0);
}

button.sr-whatsapp:hover {
  background-color: #128c7e;
  animation: none;
}

button.sr-google {
  background-color: transparent;
  color: #333;
  font-size: 12px;
  text-decoration: underline;
  margin-top: 10px;
  transition: all 0.5s ease-out;
  opacity: 0;
  transform: translateY(-10px);
}

button.sr-google.show {
  opacity: 0.5;
  transform: translateY(0);
}

#sr-message {
  margin: 10px 0;
  font-size: 16px;
  color: #333;
  transition: all 1s ease-out;
  line-height: 1.4;
}

#sr-message.fade-out {
  transform: scale(0.9);
  opacity: 0.5;
}

#sr-message.fade-out-complaint {
  transform: scale(0.95);
  opacity: 0.6;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
  }
}

.sr-google-button {
  background-color: #4285F4;
  color: white;
  font-size: 15px;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 8px;
  display: inline-block;
  animation: pulse 2s infinite;
  transition: transform 0.3s ease;
  margin-bottom: 20px;
}

.sr-google-button:hover {
  transform: scale(1.05);
  animation: none;
}
`;

  // Generate the combined HTML content
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Leave a Review</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div class="sr-container">
    <h1 id="sr-location-name">Loading...</h1>
    <div id="sr-stars" class="sr-stars"></div>
    <div id="sr-message"></div>
    <div id="sr-actions" class="sr-actions"></div>
  </div>
  <script>
    // Configuration
    window.smartReviewConfig = {
      whatsapp: "${whatsappLink}",
      locations: ${JSON.stringify(locations, null, 2)}
    };

    // Main Script
    const params = new URLSearchParams(window.location.search);
    const loc = params.get("loc");
    const { whatsapp, locations } = window.smartReviewConfig;

    const currentLocation = locations.find(l => l.id === loc);
    const nameEl = document.getElementById("sr-location-name");
    const starsEl = document.getElementById("sr-stars");
    const messageEl = document.getElementById("sr-message");
    const actionsEl = document.getElementById("sr-actions");

    if (!currentLocation) {
      nameEl.textContent = "Invalid location.";
    } else {
      nameEl.textContent = currentLocation.name;

      let selected = 0;
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "★";
        star.dataset.value = i;
        star.addEventListener("click", () => handleRating(i));
        starsEl.appendChild(star);
      }

      function handleRating(value) {
        if (selected !== 0) return;
        selected = value;

        document.querySelectorAll("#sr-stars span").forEach(star => {
          if (parseInt(star.dataset.value) <= value) {
            star.classList.add("sr-selected");
          } else {
            star.classList.remove("sr-selected");
          }
        });

        if (value <= 3) {
          // Add fade-out classes to stars and message
          starsEl.classList.add("fade-out-complaint");
          messageEl.classList.add("fade-out-complaint");
          
          // Set message and add elements after a short delay
          setTimeout(() => {
            messageEl.textContent = "We're sorry that your experience was not positive. Please contact us to resolve the issue.";
            actionsEl.innerHTML = \`
              <textarea id="sr-complaint" placeholder="Please describe your issue here..." rows="4"></textarea>
              <a href="#" id="sr-whatsapp-link" target="_blank">
                <button class="sr-whatsapp">Contact us on WhatsApp</button>
              </a><br>
              <a href="\${currentLocation.url}" target="_blank">
                <button class="sr-google" style="opacity: 0.5">Leave a review on Google</button>
              </a>
            \`;
            
            // Show elements with animation
            setTimeout(() => {
              const complaintInput = document.getElementById("sr-complaint");
              const whatsappLink = document.getElementById("sr-whatsapp-link");
              complaintInput.classList.add("show");
              document.querySelector(".sr-whatsapp").classList.add("show");
              document.querySelector(".sr-google").classList.add("show");

              // Add resize handler
              complaintInput.addEventListener("input", () => {
                const message = \`I have a complaint. \${complaintInput.value}\`;
                whatsappLink.href = \`\${whatsapp}?text=\${encodeURIComponent(message)}\`
              });

              // Add resize observer to limit textarea height
              const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                  const container = document.querySelector('.sr-container');
                  const containerHeight = container.offsetHeight;
                  const maxHeight = window.innerHeight * 0.9;
                  
                  if (containerHeight > maxHeight) {
                    complaintInput.style.height = (complaintInput.offsetHeight - (containerHeight - maxHeight)) + 'px';
                  }
                }
              });
              
              resizeObserver.observe(document.querySelector('.sr-container'));
            }, 100);
          }, 500);
        } else {
          // Add fade-out classes to stars and message
          starsEl.classList.add("fade-out");
          messageEl.classList.add("fade-out");
          
          // Set message and add button after a short delay
          setTimeout(() => {
            messageEl.textContent = "Thank you for your feedback! Could you please leave a review on Google?.";
            actionsEl.innerHTML = \`
              <a href="\${currentLocation.url}" target="_blank">
                <button class="sr-google-button">Leave a review on Google</button>
              </a>
            \`;
          }, 500);
        }
      }
    }
  </script>
</body>
</html>`;

  // Generate review_links.txt content
  const linksContent = reviewLinks.join('\n');

  // Create qrcodes directory if it doesn't exist
  if (!existsSync('qrcodes')) {
    mkdirSync('qrcodes');
  }

  // Generate QR codes for each location
  console.log('\nGenerating QR codes...');
  for (const location of locations) {
    const collectionUrl = `${domain}/smart_rev.html?loc=${location.id}`;
    const qrCodePath = `qrcodes/${location.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    
    try {
      await QRCode.toFile(qrCodePath, collectionUrl, {
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        width: 300,
        margin: 2
      });
      console.log(`Generated QR code for ${location.name}`);
    } catch (err) {
      console.error(`Error generating QR code for ${location.name}:`, err);
    }
  }

  // Write files
  writeFileSync('smart_rev.html', htmlContent);
  writeFileSync('generated_review_links.txt', linksContent);
  
  console.log('\nGenerated: smart_rev.html');
  console.log('Generated: generated_review_links.txt');
  console.log('Generated: QR codes in qrcodes/ directory');
  console.log('\nBuild completed successfully!');
}

// Run the builder
buildFiles().catch(console.error);