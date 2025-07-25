// app.js (updated with fetch API for real backend integration)
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.nav-link, .footer-link, [data-page]');
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      if (page) navigateToPage(page);
    });
  });


  // Room data
  const rooms = [
    {
      id: 1,
      type: 'standard',
      name: 'Standard Room',
      price: 1399,
      image: "images/standard room.jpg",
      description: 'Comfortable room with essential amenities for a pleasant stay.',
      features: ['Free Wi-Fi', 'TV', 'Air Conditioning', 'Room Service']
    },
    {
      id: 2,
      type: 'deluxe',
      name: 'Deluxe Room',
      price: 1999,
      image: "images/Deluxe room.jpg",
      description: 'Spacious room with premium amenities and a beautiful city view.',
      features: ['Free Wi-Fi', 'Smart TV', 'Mini Bar', 'Coffee Maker']
    },
    {
      id: 3,
      type: 'suite',
      name: 'Executive Suite',
      price: 2599,
      image: "images/Executive suite.jpg",
      description: 'Luxurious suite with separate living area and premium amenities.',
      features: ['Living Area', 'King Bed', 'Jacuzzi', 'City View']
    },
    {
      id: 4,
      type: 'presidential',
      name: 'Presidential Suite',
      price: 2999,
      image: "images/Presidential suite.jpg",
      description: 'Our most luxurious accommodation with exclusive services.',
      features: ['Private Butler', 'Panoramic View', 'Dining Area', 'Luxury Amenities']
    },
    {
      id: 5,
      type: 'standard',
      name: 'Twin Standard Room',
      price: 4999,
      image: "images/Twin standard room.jpg",
      description: 'Standard room with two single beds, ideal for friends or colleagues.',
      features: ['Twin Beds', 'Work Desk', 'Air Conditioning', 'City View']
    },
    {
      id: 6,
      type: 'deluxe',
      name: 'Deluxe Family Room',
      price: 6099,
      image: "images/Deluxe family room.jpg",
      description: 'Spacious room designed for families with children.',
      features: ['King Bed', 'Sofa Bed', 'Family Amenities', 'Gaming Console']
    }
  ];

  // Initialize rooms
  loadRooms('all');

  // Room filter
  document.getElementById('roomFilter').addEventListener('change', function () {
    loadRooms(this.value);
  });


  loadRooms('all');

  document.getElementById('roomFilter').addEventListener('change', function () {
    loadRooms(this.value);
  });

  document.getElementById('ctaButton').addEventListener('click', function () {
    navigateToPage('login');
  });

  document.getElementById('showRegister').addEventListener('click', function () {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Create an Account';
  });

  document.getElementById('showLogin').addEventListener('click', function () {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('authTitle').textContent = 'Login to Your Account';
  });

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        showToast('Login successful!', 'success');
        setTimeout(() => navigateToPage('home'), 1500);
      })
      .catch(err => showToast(err.message, 'danger'));
  });

  document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const aadhar = document.getElementById('registerAadhar').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'danger');
      return;
    }

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, aadhar, phone, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
      })
      .then(() => {
        showToast('Registration successful! Please login.', 'success');
        document.getElementById('registerForm').reset();
        setTimeout(() => {
          document.getElementById('registerForm').style.display = 'none';
          document.getElementById('loginForm').style.display = 'block';
          document.getElementById('authTitle').textContent = 'Login to Your Account';
        }, 1500);
      })
      .catch(err => showToast(err.message, 'danger'));
  });

  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
      })
      .then(() => {
        showToast('Thank you for reaching out! We will respond within 24 hours.', 'success');
        document.getElementById('contactForm').reset();
      })
      .catch(err => showToast(err.message, 'danger'));
  });

  flatpickr("#bookingCheckIn", {
    minDate: "today",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates) {
      document.getElementById("bookingCheckOut")._flatpickr.set("minDate", selectedDates[0].fp_incr(1));
    }
  });
  flatpickr("#bookingCheckOut", {
    minDate: new Date().fp_incr(1),
    dateFormat: "Y-m-d"
  });

  const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));

  document.getElementById('submitBooking').addEventListener('click', function () {
    const form = document.getElementById('bookingForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const roomId = document.getElementById('roomTypeId').value;
    const fullName = document.getElementById('bookingName').value;
    const phone = document.getElementById('bookingPhone').value;
    const roomType = document.getElementById('bookingRoomType').value;
    const checkInDate = document.getElementById('bookingCheckIn').value;
    const checkOutDate = document.getElementById('bookingCheckOut').value;
    const guests = document.getElementById('bookingGuests').value;
    const specialRequests = document.getElementById('bookingSpecialRequests').value;

    fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ roomId, fullName, phone, roomType, checkInDate, checkOutDate, guests, specialRequests })
    })
      .then(res => {
        if (!res.ok) throw new Error('Booking failed');
        return res.json();
      })
      // .then(() => {
      //   bookingModal.hide();
      //   showToast('Booking successful! We look forward to hosting you.', 'success');
      //   form.reset();
      // })
      .then(() => {
        document.getElementById('bookingForm').innerHTML = `
    <div class="text-center p-4">
      <h5 class="text-success">🎉 Booking Confirmed!</h5>
      <p>Thank you for choosing us. We look forward to your stay.</p>
      <button class="btn btn-outline-primary mt-3" data-bs-dismiss="modal">Close</button>
    </div>
  `;
      })

      .catch(err => showToast(err.message, 'danger'));
  });

  function navigateToPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
    document.querySelector(`.nav-link[data-page="${page}"]`)?.classList.add('active');
    window.scrollTo(0, 0);
  }

  function loadRooms(filter) {
    const roomsList = document.getElementById('roomsList');
    roomsList.innerHTML = '';
    const filteredRooms = filter === 'all' ? rooms : rooms.filter(room => room.type === filter);

    filteredRooms.forEach(room => {
      const roomCard = document.createElement('div');
      roomCard.className = 'col-md-6 col-lg-4 fade-in';
      let featuresHtml = room.features.map(f => `<li><i class="fas fa-check feature-icon"></i> ${f}</li>`).join('');
      roomCard.innerHTML = `
        <div class="card room-card">
          <img src="${room.image}" class="card-img-top room-img" alt="${room.name}">
          <div class="card-body">
            <h5 class="card-title">${room.name}</h5>
            <p class="room-price">₹${room.price} / night</p>
            <p class="card-text">${room.description}</p>
            <ul class="list-unstyled">${featuresHtml}</ul>
            <button class="btn btn-primary w-100 book-now-btn" data-room-id="${room.id}">Book Now</button>
          </div>
        </div>`;
      roomsList.appendChild(roomCard);
    });

    document.querySelectorAll('.book-now-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const roomId = this.getAttribute('data-room-id');
        const room = rooms.find(r => r.id == roomId);
        document.getElementById('roomTypeId').value = room.id;
        document.getElementById('bookingRoomType').value = room.name;
        bookingModal.show();
      });
    });
  }

  function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    toastContainer.appendChild(toast);
    new bootstrap.Toast(toast).show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  }
});


// Open modal
// document.querySelectorAll('.book-now-btn').forEach(button => {
//   button.addEventListener('click', () => {
//     document.getElementById('bookingModal').style.display = 'block';
//   });
// });

// Close modal
// function closeModal() {
//   document.getElementById('bookingModal').style.display = 'none';
// }

document.querySelectorAll('.book-now-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById('bookingModal').style.display = 'flex';
  });
});

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('bookingModal').style.display = 'none';
});

document.getElementById('closeModalFooter').addEventListener('click', () => {
  document.getElementById('bookingModal').style.display = 'none';
});
document.getElementById('bookingForm').addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Booking submitted!');
      document.getElementById('bookingModal').style.display = 'none';
      this.reset();
});