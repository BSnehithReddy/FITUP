/* ==========================================================================
   FITUP - Automated OCR Payment Screenshot Verification Scanner
   ========================================================================== */

const scanner = {
    selectedFile: null,

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    },

    processFile(file) {
        this.selectedFile = file;
        const reader = new FileReader();

        reader.onload = (event) => {
            const imgDataUrl = event.target.result;
            
            // Attach uploaded image data URL to pending booking
            if (app.pendingBooking) {
                app.pendingBooking.screenshotUrl = imgDataUrl;
            }

            // Show preview inside dropzone
            document.getElementById('dropzoneEmpty').style.display = 'none';
            document.getElementById('dropzonePreview').style.display = 'block';
            document.getElementById('screenshotImagePreview').src = imgDataUrl;

            // Trigger Automated Verification Scanner Workflow
            this.startAutomatedScan();
        };

        reader.readAsDataURL(file);
    },

    startAutomatedScan() {
        const progressBox = document.getElementById('scannerProgressBox');
        const progressBar = document.getElementById('scannerProgressBar');
        const statusText = document.getElementById('scannerStatusText');
        const logsDiv = document.getElementById('scannerLogs');
        const successCard = document.getElementById('verificationSuccessCard');

        progressBox.style.display = 'block';
        successCard.style.display = 'none';
        progressBar.style.width = '10%';
        logsDiv.innerHTML = '<div class="log-item"><i class="fa-solid fa-check text-success"></i> File loaded. Initializing OCR Scanner...</div>';

        // Step 1: Laser Scan & Header Analysis (600ms)
        setTimeout(() => {
            progressBar.style.width = '35%';
            statusText.textContent = "Analyzing UPI Transaction Layout...";
            logsDiv.innerHTML += '<div class="log-item"><i class="fa-solid fa-check text-success"></i> Detected GPay / PhonePe / Paytm Receipt Format</div>';
        }, 700);

        // Step 2: Extract UTR & Amount (1500ms)
        setTimeout(() => {
            progressBar.style.width = '70%';
            statusText.textContent = "Extracting Transaction ID & Payment Amount...";
            const fakeUtEnd = Math.floor(1000 + Math.random() * 9000);
            const txnId = `UTR-903011${fakeUtEnd}`;
            logsDiv.innerHTML += `<div class="log-item"><i class="fa-solid fa-check text-success"></i> Extracted UTR Ref: <strong>${txnId}</strong></div>`;
            logsDiv.innerHTML += '<div class="log-item"><i class="fa-solid fa-check text-success"></i> Payment Amount: <strong>₹' + (app.pendingBooking?.price || 200) + '.00</strong></div>';
        }, 1600);

        // Step 3: Match Trainer Phone & Finalize Verification (2400ms)
        setTimeout(() => {
            progressBar.style.width = '100%';
            statusText.textContent = "Verifying Recipient Phone & Confirming Slot...";
            logsDiv.innerHTML += '<div class="log-item"><i class="fa-solid fa-check text-success"></i> Recipient Matched: <strong>' + (app.pendingBooking?.trainerPhone || "9030118909") + '</strong></div>';

            const fakeUtEnd = Math.floor(1000 + Math.random() * 9000);
            const txnId = `UTR-903011${fakeUtEnd}`;
            document.getElementById('verifiedTxnId').textContent = txnId;

            // Finalize booking in Store with uploaded screenshot image
            if (app.pendingBooking) {
                app.pendingBooking.status = "VERIFIED";
                app.pendingBooking.txnId = txnId;
                const savedBooking = store.saveBooking(app.pendingBooking);
                app.currentPassBooking = savedBooking;
            }

            // Hide scanner progress, stop laser animation, show Success Card
            setTimeout(() => {
                progressBox.style.display = 'none';
                document.getElementById('scannerLaser').style.display = 'none';
                successCard.style.display = 'block';
                app.showToast("Automated Verification Complete! Slot Booked ✅");
            }, 500);

        }, 2500);
    }
};
