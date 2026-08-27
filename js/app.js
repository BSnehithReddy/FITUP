/* ==========================================================================
   FITUP - Main Application Logic & UI Router
   ========================================================================== */

const app = {
    selectedGym: null,
    selectedTrainer: null,
    selectedDate: null,
    selectedSlot: null,
    pendingBooking: null,
    currentPassBooking: null,
    activeOwnerTab: "gyms",

    init() {
        auth.updateNavState();
        this.renderGyms();
        this.renderMyBookings();
        this.renderOwnerDashboard();
    },

    // Helper: Compute gym individual booking count & revenue
    getGymStats(gymId) {
        const bookings = store.getBookings().filter(b => b.gymId === gymId);
        const totalSlotsBooked = bookings.length;
        const totalEarnings = bookings.reduce((sum, b) => sum + (b.price || 200), 0);
        return { totalSlotsBooked, totalEarnings, bookings };
    },

    // Navigation & Section Router
    showSection(sectionId) {
        document.querySelectorAll('.app-section').forEach(sec => sec.style.display = 'none');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

        const target = document.getElementById(sectionId + 'Section');
        if (target) target.style.display = 'block';

        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (navLink) navLink.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (sectionId === 'owner') {
            const user = store.getCurrentUser();
            if (!user || user.role !== 'owner') {
                auth.openAuthModal('login');
                this.showToast("Please log in with Gym Owner credentials to access the Owner Interface.");
            } else {
                this.renderOwnerDashboard();
            }
        } else if (sectionId === 'bookings') {
            this.renderMyBookings();
        } else if (sectionId === 'search') {
            this.renderGyms();
        }
    },

    // RENDER GYMS (Box III)
    renderGyms(filteredList = null) {
        const grid = document.getElementById('gymsGrid');
        const list = filteredList || store.getGyms();

        if (list.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-8 text-muted">No gyms found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = list.map(gym => {
            const trainers = store.getTrainersByGym(gym.id);
            return `
                <div class="gym-card">
                    <div class="gym-card-img">
                        <img src="${gym.image}" alt="${gym.name}" loading="lazy">
                        <span class="gym-card-badge"><i class="fa-solid fa-star"></i> ${gym.rating || 4.9}</span>
                    </div>
                    <div class="gym-card-body">
                        <h3 class="gym-card-title">${gym.name}</h3>
                        <p class="gym-card-location"><i class="fa-solid fa-location-dot"></i> ${gym.address || gym.location}</p>
                        
                        <div class="gym-card-amenities">
                            ${(gym.amenities || []).map(a => `<span class="amenity-chip">${a}</span>`).join('')}
                        </div>

                        <div class="gym-card-footer">
                            <div class="gym-card-price">
                                <span class="lbl">${trainers.length} Trainers Available</span>
                                <span class="val">₹${gym.startingPrice || 200} <small>/ Slot</small></span>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="app.openGymDetails('${gym.id}')">
                                Select Gym <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterGyms() {
        const query = document.getElementById('gymSearchInput').value.toLowerCase().trim();
        const loc = document.getElementById('locationFilter').value;
        const price = document.getElementById('priceFilter').value;

        let gyms = store.getGyms();

        if (query) {
            gyms = gyms.filter(g => 
                g.name.toLowerCase().includes(query) ||
                g.location.toLowerCase().includes(query) ||
                (g.amenities && g.amenities.some(a => a.toLowerCase().includes(query)))
            );
        }

        if (loc !== 'all') {
            gyms = gyms.filter(g => g.location === loc);
        }

        if (price !== 'all') {
            gyms = gyms.filter(g => (g.startingPrice || 200) <= parseInt(price));
        }

        this.renderGyms(gyms);
    },

    // RENDER GYM DETAILS & TRAINERS (Box IV & V)
    openGymDetails(gymId) {
        const gym = store.getGymById(gymId);
        if (!gym) return;
        this.selectedGym = gym;

        const banner = document.getElementById('gymDetailBanner');
        banner.innerHTML = `
            <img src="${gym.image}" class="gym-detail-img" alt="${gym.name}">
            <div class="gym-detail-info">
                <span class="badge-pill mb-2"><i class="fa-solid fa-certificate"></i> FITUP Verified Gym</span>
                <h2>${gym.name}</h2>
                <p class="loc"><i class="fa-solid fa-location-dot"></i> ${gym.address}</p>
                <p class="text-muted">${gym.description || 'Top tier fitness center.'}</p>
            </div>
        `;

        const trainers = store.getTrainersByGym(gymId);
        const trainersGrid = document.getElementById('trainersGrid');

        if (trainers.length === 0) {
            trainersGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-muted">No trainers added for this gym yet.</p>
                </div>
            `;
        } else {
            trainersGrid.innerHTML = trainers.map(tr => `
                <div class="trainer-card">
                    <div class="trainer-header">
                        <img src="${tr.image}" class="trainer-avatar" alt="${tr.name}">
                        <div class="trainer-meta">
                            <h4>${tr.name}</h4>
                            <div class="spec">${tr.specialization}</div>
                            <div class="exp">${tr.experience}</div>
                        </div>
                    </div>

                    <div class="trainer-pricing">
                        <span class="label">Single 2-Hour Slot:</span>
                        <span class="amount">₹${tr.price || 200}</span>
                    </div>

                    <button class="btn btn-primary btn-block" onclick="app.openSlotPicker('${tr.id}')">
                        <i class="fa-solid fa-clock"></i> Choose 2-Hour Slot
                    </button>
                </div>
            `).join('');
        }

        this.showSection('gymDetail');
    },

    // SLOT PICKER MODAL (Box V)
    openSlotPicker(trainerId) {
        const user = store.getCurrentUser();
        if (!user) {
            auth.openAuthModal('login');
            this.showToast("Please login or register to book a slot!");
            return;
        }

        const tr = store.getTrainerById(trainerId);
        if (!tr) return;
        this.selectedTrainer = tr;

        const header = document.getElementById('slotPickerHeader');
        header.innerHTML = `
            <h3>Book 2-Hour Slot with ${tr.name}</h3>
            <p class="text-muted">${this.selectedGym.name} • ${tr.specialization}</p>
        `;

        // Render Dates (Today, Tomorrow, +2 days)
        const dateSelector = document.getElementById('dateSelector');
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 4; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push({
                iso: d.toISOString().split('T')[0],
                day: i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' })),
                date: d.getDate() + ' ' + d.toLocaleDateString('en-US', { month: 'short' })
            });
        }

        dateSelector.innerHTML = dates.map((d, idx) => `
            <div class="date-chip ${idx === 0 ? 'active' : ''}" onclick="app.selectDate('${d.iso}', this)">
                <span class="day">${d.day}</span>
                <span class="date">${d.date}</span>
            </div>
        `).join('');

        this.selectedDate = dates[0].iso;

        // Render Slots
        const slotsGrid = document.getElementById('slotsGrid');
        const availableSlots = store.getSlots();

        slotsGrid.innerHTML = availableSlots.map(s => `
            <div class="slot-card" onclick="app.selectSlot('${s.time}', this)">
                <div class="slot-time">${s.time}</div>
                <small class="text-muted">${s.category || '2 Hours'}</small>
            </div>
        `).join('');

        this.selectedSlot = null;
        this.updateBookingSummary();

        document.getElementById('slotPickerModal').classList.add('active');
    },

    closeSlotPickerModal() {
        document.getElementById('slotPickerModal').classList.remove('active');
    },

    selectDate(dateIso, element) {
        document.querySelectorAll('.date-chip').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        this.selectedDate = dateIso;
        this.updateBookingSummary();
    },

    selectSlot(slotTime, element) {
        document.querySelectorAll('.slot-card').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        this.selectedSlot = slotTime;
        this.updateBookingSummary();
    },

    updateBookingSummary() {
        const btn = document.getElementById('confirmSlotBtn');
        const gymNameEl = document.getElementById('summaryGymName');
        const trainerNameEl = document.getElementById('summaryTrainerName');
        const slotTimeEl = document.getElementById('summarySlotTime');
        const priceEl = document.getElementById('summaryPrice');
        const btnAmount = document.getElementById('btnPayAmount');

        gymNameEl.textContent = this.selectedGym ? this.selectedGym.name : '-';
        trainerNameEl.textContent = this.selectedTrainer ? this.selectedTrainer.name : '-';
        slotTimeEl.textContent = (this.selectedDate && this.selectedSlot) ? `${this.selectedDate} (${this.selectedSlot})` : 'Select a slot above';

        const price = this.selectedTrainer ? this.selectedTrainer.price : 200;
        priceEl.textContent = `₹${price}`;
        btnAmount.textContent = price;

        btn.disabled = !(this.selectedDate && this.selectedSlot);
    },

    // PROCEED TO PAYMENT (Box VI)
    proceedToPayment() {
        const user = store.getCurrentUser();
        if (!user || !this.selectedGym || !this.selectedTrainer || !this.selectedSlot) return;

        this.pendingBooking = {
            userName: user.name,
            userPhone: user.phone,
            gymId: this.selectedGym.id,
            gymName: this.selectedGym.name,
            trainerId: this.selectedTrainer.id,
            trainerName: this.selectedTrainer.name,
            trainerPhone: this.selectedTrainer.phone || "9030118909",
            date: this.selectedDate,
            slotTime: this.selectedSlot,
            price: this.selectedTrainer.price || 200,
            status: "PENDING",
            screenshotUrl: null
        };

        this.closeSlotPickerModal();

        // Fill Payment Modal details
        document.getElementById('payTrainerName').textContent = this.selectedTrainer.name;
        document.getElementById('payTrainerPhone').textContent = this.selectedTrainer.phone || "9030118909";
        document.getElementById('payAmount').textContent = `₹${this.pendingBooking.price}.00`;

        // Reset Dropzone & Scanner state
        document.getElementById('dropzoneEmpty').style.display = 'block';
        document.getElementById('dropzonePreview').style.display = 'none';
        document.getElementById('scannerProgressBox').style.display = 'none';
        document.getElementById('verificationSuccessCard').style.display = 'none';

        document.getElementById('paymentModal').classList.add('active');
    },

    closePaymentModal() {
        document.getElementById('paymentModal').classList.remove('active');
    },

    copyPhone() {
        const phone = document.getElementById('payTrainerPhone').textContent;
        navigator.clipboard.writeText(phone);
        this.showToast(`Phone ${phone} copied to clipboard!`);
    },

    showBookingPass() {
        this.closePaymentModal();
        if (!this.currentPassBooking) return;

        const b = this.currentPassBooking;
        document.getElementById('passGymName').textContent = b.gymName;
        document.getElementById('passGymLocation').textContent = b.date;
        document.getElementById('passTrainerName').textContent = b.trainerName;
        document.getElementById('passTrainerPhone').textContent = b.trainerPhone;
        document.getElementById('passDate').textContent = b.date;
        document.getElementById('passSlot').textContent = b.slotTime;
        document.getElementById('passAmount').textContent = `₹${b.price}.00`;
        document.getElementById('passClientName').textContent = b.userName;
        document.getElementById('passBookingCode').textContent = b.id;

        document.getElementById('passModal').classList.add('active');
    },

    closePassModal() {
        document.getElementById('passModal').classList.remove('active');
        this.showSection('bookings');
    },

    // RENDER MY BOOKINGS
    renderMyBookings() {
        const user = store.getCurrentUser();
        const listContainer = document.getElementById('myBookingsList');
        if (!user) return;

        const bookings = store.getBookings().filter(b => b.userPhone === user.phone || user.role === 'owner');

        if (bookings.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-muted">No booking passes found.</p>
                    <button class="btn btn-primary mt-3" onclick="app.showSection('search')">Book Your First PT Slot (₹200)</button>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = bookings.map(b => `
            <div class="step-card mb-4">
                <div style="display:flex; justify-content:space-between; align-items:center;" class="mb-2">
                    <span class="badge-pill"><i class="fa-solid fa-ticket"></i> ${b.id}</span>
                    <span class="badge-pill" style="color:var(--primary);">${b.status === 'VERIFIED' ? 'Verified ✅' : 'Pending'}</span>
                </div>
                <h3>${b.gymName} — ${b.trainerName}</h3>
                <p><strong>Date & Slot:</strong> ${b.date} (${b.slotTime})</p>
                <p><strong>Paid:</strong> ₹${b.price} (Trainer: ${b.trainerPhone})</p>
                <button class="btn btn-outline btn-sm mt-3" onclick="app.viewPassById('${b.id}')">
                    <i class="fa-solid fa-qrcode"></i> View Digital Pass
                </button>
            </div>
        `).join('');
    },

    viewPassById(bookingId) {
        const b = store.getBookings().find(item => item.id === bookingId);
        if (b) {
            this.currentPassBooking = b;
            this.showBookingPass();
        }
    },

    // OWNER DASHBOARD & MANAGEMENT INTERFACE
    renderOwnerDashboard() {
        const user = store.getCurrentUser();
        if (user && user.role === 'owner') {
            document.getElementById('ownerDisplayName').textContent = user.name;
            document.getElementById('ownerDisplayPhone').textContent = user.phone;
        }

        const gyms = store.getGyms();
        const trainers = store.getTrainers();
        const bookings = store.getBookings();

        // Compute total platform revenue
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 200), 0);

        document.getElementById('oTotalGyms').textContent = gyms.length;
        document.getElementById('oTotalTrainers').textContent = trainers.length;
        document.getElementById('oTotalBookings').textContent = bookings.length;
        document.getElementById('oTotalRevenue').textContent = `₹${totalRevenue}`;

        this.renderOwnerGymEarningsCards();
        this.renderOwnerGymsTable();
        this.renderOwnerTrainersTable();
        this.renderOwnerSlotsGrid();
        this.renderOwnerBookingsTable();
    },

    renderOwnerGymEarningsCards() {
        const gyms = store.getGyms();
        const grid = document.getElementById('ownerGymEarningsGrid');
        if (!grid) return;

        const maxEarnings = Math.max(...gyms.map(g => this.getGymStats(g.id).totalEarnings), 100);

        grid.innerHTML = gyms.map(gym => {
            const stats = this.getGymStats(gym.id);
            const trainersCount = store.getTrainersByGym(gym.id).length;
            const progressPercent = Math.min(100, Math.round((stats.totalEarnings / (maxEarnings || 1)) * 100));

            return `
                <div class="gym-earning-card">
                    <div class="ge-header">
                        <img src="${gym.image}" class="ge-thumb" alt="${gym.name}">
                        <div class="ge-title">
                            <h4>${gym.name}</h4>
                            <span><i class="fa-solid fa-location-dot"></i> ${gym.location} • ${trainersCount} Trainers</span>
                        </div>
                    </div>

                    <div class="ge-metrics">
                        <div class="ge-metric-item">
                            <span class="lbl">Slots Booked:</span>
                            <span class="val"><i class="fa-solid fa-ticket" style="color:var(--secondary);"></i> ${stats.totalSlotsBooked} Slots</span>
                        </div>
                        <div class="ge-metric-item" style="text-align:right;">
                            <span class="lbl">Individual Earnings:</span>
                            <span class="val-revenue">₹${stats.totalEarnings}</span>
                        </div>
                    </div>

                    <div class="ge-progress-track">
                        <div class="ge-progress-fill" style="width: ${Math.max(15, progressPercent)}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    switchOwnerTab(tabName) {
        this.activeOwnerTab = tabName;
        document.querySelectorAll('.owner-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.owner-tab-content').forEach(c => c.style.display = 'none');

        if (tabName === 'gyms') {
            document.getElementById('tabGymsBtn').classList.add('active');
            document.getElementById('ownerGymsTab').style.display = 'block';
        } else if (tabName === 'trainers') {
            document.getElementById('tabTrainersBtn').classList.add('active');
            document.getElementById('ownerTrainersTab').style.display = 'block';
        } else if (tabName === 'slots') {
            document.getElementById('tabSlotsBtn').classList.add('active');
            document.getElementById('ownerSlotsTab').style.display = 'block';
        } else if (tabName === 'bookings') {
            document.getElementById('tabBookingsBtn').classList.add('active');
            document.getElementById('ownerBookingsTab').style.display = 'block';
        }
    },

    renderOwnerGymsTable() {
        const gyms = store.getGyms();
        const tbody = document.getElementById('ownerGymsTableBody');
        tbody.innerHTML = gyms.map(g => {
            const trCount = store.getTrainersByGym(g.id).length;
            const stats = this.getGymStats(g.id);

            return `
                <tr>
                    <td><strong>${g.name}</strong></td>
                    <td>${g.location}</td>
                    <td>${trCount} Trainers</td>
                    <td><span class="badge-pill" style="font-size:0.75rem;"><i class="fa-solid fa-clock"></i> ${stats.totalSlotsBooked} Booked</span></td>
                    <td><strong class="highlight-revenue" style="color:var(--primary); font-family:var(--font-heading); font-size:1.1rem;">₹${stats.totalEarnings}</strong></td>
                    <td><span class="badge-pill" style="font-size:0.7rem;">Active</span></td>
                    <td>
                        <button class="btn btn-outline btn-xs" onclick="app.editGym('${g.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-icon btn-xs" onclick="app.deleteGym('${g.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAddGymModal() {
        document.getElementById('gymId').value = '';
        document.getElementById('gymForm').reset();
        document.getElementById('gymModalTitle').innerHTML = '<i class="fa-solid fa-building"></i> Add New Gym';
        document.getElementById('gymModal').classList.add('active');
    },

    editGym(gymId) {
        const gym = store.getGymById(gymId);
        if (!gym) return;
        document.getElementById('gymId').value = gym.id;
        document.getElementById('gymName').value = gym.name;
        document.getElementById('gymLocation').value = gym.location;
        document.getElementById('gymImage').value = gym.image;
        document.getElementById('gymAmenities').value = (gym.amenities || []).join(', ');
        document.getElementById('gymDescription').value = gym.description || '';
        
        document.getElementById('gymModalTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Edit Gym: ' + gym.name;
        document.getElementById('gymModal').classList.add('active');
    },

    closeGymModal() {
        document.getElementById('gymModal').classList.remove('active');
    },

    saveGym(e) {
        e.preventDefault();
        const gymData = {
            id: document.getElementById('gymId').value || null,
            name: document.getElementById('gymName').value.trim(),
            location: document.getElementById('gymLocation').value.trim(),
            address: document.getElementById('gymLocation').value.trim() + " Fitness Hub",
            image: document.getElementById('gymImage').value.trim(),
            rating: 4.9,
            startingPrice: 200,
            amenities: document.getElementById('gymAmenities').value.split(',').map(s => s.trim()).filter(Boolean),
            description: document.getElementById('gymDescription').value.trim()
        };

        store.saveGym(gymData);
        this.closeGymModal();
        this.renderOwnerDashboard();
        this.renderGyms();
        this.showToast("Gym details saved successfully! ✅");
    },

    deleteGym(gymId) {
        if (confirm("Are you sure you want to delete this gym and its trainers?")) {
            store.deleteGym(gymId);
            this.renderOwnerDashboard();
            this.renderGyms();
            this.showToast("Gym deleted.");
        }
    },

    // TRAINER MANAGEMENT
    renderOwnerTrainersTable() {
        const trainers = store.getTrainers();
        const tbody = document.getElementById('ownerTrainersTableBody');
        tbody.innerHTML = trainers.map(tr => {
            const gym = store.getGymById(tr.gymId);
            return `
                <tr>
                    <td><strong>${tr.name}</strong></td>
                    <td>${gym ? gym.name : 'Unassigned'}</td>
                    <td><code>${tr.phone}</code></td>
                    <td>${tr.specialization}</td>
                    <td>₹${tr.price || 200}</td>
                    <td>
                        <button class="btn btn-outline btn-xs" onclick="app.editTrainer('${tr.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-icon btn-xs" onclick="app.deleteTrainer('${tr.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openAddTrainerModal() {
        const gyms = store.getGyms();
        const select = document.getElementById('trainerGymSelect');
        select.innerHTML = gyms.map(g => `<option value="${g.id}">${g.name} (${g.location})</option>`).join('');

        document.getElementById('trainerId').value = '';
        document.getElementById('trainerForm').reset();
        document.getElementById('trainerPrice').value = 200;
        document.getElementById('trainerModalTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Add New Trainer';
        document.getElementById('trainerModal').classList.add('active');
    },

    editTrainer(trainerId) {
        const tr = store.getTrainerById(trainerId);
        if (!tr) return;

        const gyms = store.getGyms();
        const select = document.getElementById('trainerGymSelect');
        select.innerHTML = gyms.map(g => `<option value="${g.id}" ${g.id === tr.gymId ? 'selected' : ''}>${g.name}</option>`).join('');

        document.getElementById('trainerId').value = tr.id;
        document.getElementById('trainerName').value = tr.name;
        document.getElementById('trainerPhone').value = tr.phone;
        document.getElementById('trainerSpecialization').value = tr.specialization;
        document.getElementById('trainerExperience').value = tr.experience;
        document.getElementById('trainerPrice').value = tr.price || 200;
        document.getElementById('trainerImage').value = tr.image;

        document.getElementById('trainerModalTitle').innerHTML = '<i class="fa-solid fa-pen"></i> Edit Trainer: ' + tr.name;
        document.getElementById('trainerModal').classList.add('active');
    },

    closeTrainerModal() {
        document.getElementById('trainerModal').classList.remove('active');
    },

    saveTrainer(e) {
        e.preventDefault();
        const trData = {
            id: document.getElementById('trainerId').value || null,
            gymId: document.getElementById('trainerGymSelect').value,
            name: document.getElementById('trainerName').value.trim(),
            phone: document.getElementById('trainerPhone').value.trim(),
            specialization: document.getElementById('trainerSpecialization').value.trim(),
            experience: document.getElementById('trainerExperience').value.trim(),
            price: parseInt(document.getElementById('trainerPrice').value) || 200,
            image: document.getElementById('trainerImage').value.trim()
        };

        store.saveTrainer(trData);
        this.closeTrainerModal();
        this.renderOwnerDashboard();
        this.showToast("Trainer details saved! ✅");
    },

    deleteTrainer(trainerId) {
        if (confirm("Delete this trainer?")) {
            store.deleteTrainer(trainerId);
            this.renderOwnerDashboard();
            this.showToast("Trainer deleted.");
        }
    },

    // SLOTS MANAGEMENT
    renderOwnerSlotsGrid() {
        const slots = store.getSlots();
        const grid = document.getElementById('ownerSlotsGrid');
        grid.innerHTML = slots.map(s => `
            <div class="slot-manage-card">
                <div>
                    <strong style="font-size:1.05rem;">${s.time}</strong>
                    <div class="text-muted" style="font-size:0.8rem;">Category: ${s.category || '2 Hours'}</div>
                </div>
                <button class="btn btn-icon btn-xs" onclick="app.deleteSlot('${s.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    },

    openAddSlotModal() {
        document.getElementById('slotModal').classList.add('active');
    },

    closeSlotModal() {
        document.getElementById('slotModal').classList.remove('active');
    },

    saveSlot(e) {
        e.preventDefault();
        const start = document.getElementById('slotStartTime').value;
        const end = document.getElementById('slotEndTime').value;

        if (!start || !end) return;

        const formatTime = (tStr) => {
            const [h, m] = tStr.split(':');
            let hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${hour < 10 ? '0' + hour : hour}:${m} ${ampm}`;
        };

        const timeString = `${formatTime(start)} - ${formatTime(end)}`;
        store.saveSlot({ time: timeString, category: "Custom 2-Hour" });
        this.closeSlotModal();
        this.renderOwnerDashboard();
        this.showToast("New Slot added! ✅");
    },

    deleteSlot(slotId) {
        store.deleteSlot(slotId);
        this.renderOwnerDashboard();
        this.showToast("Slot deleted.");
    },

    // BOOKINGS LIST & SCREENSHOT INSPECTION
    renderOwnerBookingsTable() {
        const bookings = store.getBookings();
        const tbody = document.getElementById('ownerBookingsTableBody');
        tbody.innerHTML = bookings.map(b => {
            const hasScreenshot = Boolean(b.screenshotUrl);
            const imgTag = hasScreenshot 
                ? `<img src="${b.screenshotUrl}" class="tbl-screenshot-thumb" title="Click to enlarge" onclick="app.openScreenshotModal('${b.id}')">`
                : `<span class="badge-pill" style="font-size:0.7rem; color:var(--text-dim);"><i class="fa-solid fa-image"></i> Auto Receipt</span>`;

            return `
                <tr>
                    <td><code>${b.id}</code></td>
                    <td><strong>${b.userName}</strong><br><small class="text-muted">${b.userPhone}</small></td>
                    <td>${b.gymName}<br><small class="text-muted">${b.trainerName}</small></td>
                    <td>${b.date}<br><small class="text-muted">${b.slotTime}</small></td>
                    <td><strong>₹${b.price}</strong></td>
                    <td>${imgTag}</td>
                    <td><span class="badge-pill" style="color:var(--primary);">${b.status === 'VERIFIED' ? 'Verified ✅' : 'Pending'}</span></td>
                    <td>
                        <button class="btn btn-outline btn-xs" onclick="app.viewPassById('${b.id}')"><i class="fa-solid fa-eye"></i> View Pass</button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    openScreenshotModal(bookingId) {
        const b = store.getBookings().find(item => item.id === bookingId);
        if (!b) return;

        const imgEl = document.getElementById('modalScreenshotImg');
        imgEl.src = b.screenshotUrl || 'https://images.unsplash.com/photo-1556742049-0a67ef652a12?auto=format&fit=crop&w=600&q=80';
        document.getElementById('modalScreenshotTxn').textContent = b.txnId || b.id;

        document.getElementById('screenshotPreviewModal').classList.add('active');
    },

    closeScreenshotModal() {
        document.getElementById('screenshotPreviewModal').classList.remove('active');
    },

    // Toast Notification helper
    showToast(message) {
        let toast = document.getElementById('fitupToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'fitupToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: #121826;
                border: 1px solid var(--primary);
                color: #FFF;
                padding: 12px 20px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                z-index: 9999;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: fadeIn 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> ${message}`;
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3500);
    }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
