const app = {
  
    data: {
        trains: [
            { id: 101, name: "Rajdhani Express", departure: "09:00", arrival: "17:00", price: 1500, duration: "8h 00m" },
            { id: 102, name: "Shatabdi Express", departure: "06:00", arrival: "14:30", price: 1200, duration: "8h 30m" },
            { id: 103, name: "Duronto Express", departure: "22:00", arrival: "06:00", price: 1800, duration: "8h 00m" },
            { id: 104, name: "Garib Rath", departure: "15:00", arrival: "23:30", price: 800, duration: "8h 30m" },
        ],
        selectedTrain: null,
        selectedSeats: [],
        bookings: [],
        searchParams: {}
    },

  
    init: function() {
       
        document.getElementById('date').valueAsDate = new Date();
        this.loadBookings();
    },


    navigate: function(sectionId) {
       
        document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
    
        document.getElementById(sectionId).classList.add('active');
        window.scrollTo(0, 0);
    },

   
    handleSearch: function(e) {
        e.preventDefault();
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        const date = document.getElementById('date').value;

        if (from === to) {
            this.showToast("Source and Destination cannot be the same!", "error");
            return;
        }

        this.data.searchParams = { from, to, date };
        this.renderTrainList();
        this.navigate('results');
        this.showToast(`Searching trains from ${from} to ${to}...`);
    },

   
    renderTrainList: function() {
        const listContainer = document.getElementById('train-list');
        listContainer.innerHTML = '';

        this.data.trains.forEach(train => {
            const card = document.createElement('div');
            card.className = 'train-card';
            card.innerHTML = `
                <div class="train-info">
                    <h3>${train.name}</h3>
                    <div class="train-meta">
                        <span>🕒 Dep: ${train.departure}</span>
                        <span>🕗 Arr: ${train.arrival}</span>
                        <span>⏱ ${train.duration}</span>
                    </div>
                </div>
                <div style="text-align:right; display:flex; flex-direction:column; align-items:end; gap:10px;">
                    <div class="train-price">₹${train.price}</div>
                    <button class="btn-primary" style="width:auto; padding:8px 16px;" onclick="app.selectTrain(${train.id})">Select Seats</button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    },

   
    selectTrain: function(trainId) {
        this.data.selectedTrain = this.data.trains.find(t => t.id === trainId);
        this.data.selectedSeats = [];
        this.renderSeatMap();
        
        document.getElementById('selected-train-name').innerText = this.data.selectedTrain.name + ` (${this.data.searchParams.from} ➝ ${this.data.searchParams.to})`;
        this.updateSeatSummary();
        this.navigate('seat-selection');
    },

  
    renderSeatMap: function() {
        const mapContainer = document.getElementById('seat-map');
        mapContainer.innerHTML = '';
        
      
        const totalSeats = 40;
        
        for (let i = 1; i <= totalSeats; i++) {
            // Create aisle space after every 2 seats (index 1, 6, 11...)
            if (i > 1 && (i - 1) % 4 === 0) {
                const spacer = document.createElement('div');
                spacer.className = 'aisle-spacer';
                mapContainer.appendChild(spacer);
            }

            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.innerText = i;

            
            if (Math.random() < 0.3) {
                seat.classList.add('occupied');
                seat.title = "Seat Occupied";
            } else {
                seat.onclick = () => this.toggleSeat(seat, i);
                seat.title = "Select Seat";
            }

            mapContainer.appendChild(seat);
        }
    },

    
    toggleSeat: function(seatElement, seatNumber) {
        if (seatElement.classList.contains('occupied')) return;

        if (seatElement.classList.contains('selected')) {
            seatElement.classList.remove('selected');
            this.data.selectedSeats = this.data.selectedSeats.filter(s => s !== seatNumber);
        } else {
            if (this.data.selectedSeats.length >= 6) {
                this.showToast("Max 6 seats allowed per booking.", "error");
                return;
            }
            seatElement.classList.add('selected');
            this.data.selectedSeats.push(seatNumber);
        }
        this.updateSeatSummary();
    },

   
    updateSeatSummary: function() {
        const count = this.data.selectedSeats.length;
        const price = count * this.data.selectedTrain.price;
        
        document.getElementById('selected-seats-display').innerText = 
            count > 0 ? this.data.selectedSeats.sort((a,b)=>a-b).join(', ') : 'None';
        
        document.getElementById('total-price').innerText = `₹${price}`;
    },

 
    proceedToBooking: function() {
        if (this.data.selectedSeats.length === 0) {
            this.showToast("Please select at least one seat.", "error");
            return;
        }
   
        document.getElementById('summary-train').innerText = this.data.selectedTrain.name;
        document.getElementById('summary-seats').innerText = this.data.selectedSeats.join(', ');
        document.getElementById('summary-price').innerText = document.getElementById('total-price').innerText;
        
        this.navigate('booking-form');
    },

 
    confirmBooking: function(e) {
        e.preventDefault();
        
        const name = document.getElementById('p-name').value;
        
      
        const ticketId = 'TKT' + Math.floor(Math.random() * 100000);
        const totalPrice = this.data.selectedSeats.length * this.data.selectedTrain.price;

      
        const booking = {
            id: ticketId,
            trainName: this.data.selectedTrain.name,
            from: this.data.searchParams.from,
            to: this.data.searchParams.to,
            date: this.data.searchParams.date,
            seats: [...this.data.selectedSeats],
            price: totalPrice,
            passenger: name
        };

       
        this.data.bookings.unshift(booking); 
        this.saveBookings();

       
        document.getElementById('ticket-id').innerText = booking.id;
        document.getElementById('ticket-name').innerText = booking.passenger;
        document.getElementById('ticket-train').innerText = `${booking.trainName} (${booking.from} to ${booking.to})`;
        document.getElementById('ticket-date').innerText = booking.date;
        document.getElementById('ticket-seats').innerText = booking.seats.join(', ');
        document.getElementById('ticket-price').innerText = `₹${booking.price}`;

        this.showToast("Booking Successful!");
        this.navigate('ticket-view');
    },

 
    saveBookings: function() {
        localStorage.setItem('railway_bookings', JSON.stringify(this.data.bookings));
    },

    loadBookings: function() {
        const stored = localStorage.getItem('railway_bookings');
        if (stored) {
            this.data.bookings = JSON.parse(stored);
        }
    },

    renderMyBookings: function() {
        const list = document.getElementById('bookings-list');
        list.innerHTML = '';

        if (this.data.bookings.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">No bookings found.</p>';
            return;
        }

        this.data.bookings.forEach(b => {
            const item = document.createElement('div');
            item.className = 'booking-list-item';
            item.innerHTML = `
                <div>
                    <h4 style="color:var(--primary-color)">${b.trainName}</h4>
                    <div style="font-size:0.9rem; color:#555;">
                        ${b.date} | ${b.from} ➝ ${b.to}
                    </div>
                    <div style="font-size:0.8rem; color:#888;">
                        Seats: ${b.seats.join(', ')}
                    </div>
                </div>
                <div style="text-align:right">
                    <div style="font-weight:bold; margin-bottom:5px;">₹${b.price}</div>
                    <span class="status-badge">Confirmed</span>
                </div>
            `;
            list.appendChild(item);
        });
    },

   
    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        if(type === 'error') toast.style.borderLeft = "4px solid #f44336";
        else toast.style.borderLeft = "4px solid #4caf50";
        
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};


document.querySelector('.nav-links button:last-child').addEventListener('click', () => {
    app.renderMyBookings();
});


document.addEventListener('DOMContentLoaded', () => {
    app.init();
});