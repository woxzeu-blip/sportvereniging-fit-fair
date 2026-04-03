document.addEventListener('DOMContentLoaded', function() {
    loadActivities();
    setupModalHandlers();
});

function loadActivities() {
    fetch('/api/activities')
        .then(response => response.json())
        .then(activities => {
            displayActivities(activities);
        })
        .catch(error => {
            console.error('Error loading activities:', error);
            document.getElementById('activities-list').innerHTML = '<p>Er is een fout opgetreden bij het laden van de activiteiten.</p>';
        });
}

function displayActivities(activities) {
    const container = document.getElementById('activities-list');
    
    if (activities.length === 0) {
        container.innerHTML = '<p>Er zijn momenteel geen activiteiten gepland.</p>';
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-card" onclick="showActivityDetails(${activity.id})">
            <h3>${activity.title}</h3>
            <span class="activity-type">${activity.type}</span>
            <div class="activity-meta">
                <span>📅 ${formatDate(activity.date)}</span>
                <span>🕐 ${activity.time || 'Tijd n.t.b.'}</span>
                <span>📍 ${activity.location || 'Locatie n.t.b.'}</span>
                ${activity.max_participants ? `<span>👥 Max. ${activity.max_participants} deelnemers</span>` : ''}
            </div>
            <p class="activity-description">${activity.description || 'Geen beschrijving beschikbaar.'}</p>
            <button class="btn" onclick="event.stopPropagation(); showRegistrationForm(${activity.id})">Aanmelden</button>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
}

function showActivityDetails(activityId) {
    fetch(`/api/activities/${activityId}`)
        .then(response => response.json())
        .then(activity => {
            const detailsHtml = `
                <h2>${activity.title}</h2>
                <span class="activity-type">${activity.type}</span>
                <div class="activity-meta">
                    <p><strong>Datum:</strong> ${formatDate(activity.date)}</p>
                    <p><strong>Tijd:</strong> ${activity.time || 'Tijd n.t.b.'}</p>
                    <p><strong>Locatie:</strong> ${activity.location || 'Locatie n.t.b.'}</p>
                    ${activity.max_participants ? `<p><strong>Maximaal deelnemers:</strong> ${activity.max_participants}</p>` : ''}
                </div>
                <div class="activity-description">
                    <p>${activity.description || 'Geen beschrijving beschikbaar.'}</p>
                </div>
                <button class="btn" onclick="showRegistrationForm(${activity.id})">Aanmelden</button>
            `;
            
            document.getElementById('activity-details').innerHTML = detailsHtml;
            document.getElementById('activity-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading activity details:', error);
        });
}

function showRegistrationForm(activityId) {
    document.getElementById('activity-id').value = activityId;
    document.getElementById('registration-form').reset();
    document.getElementById('registration-message').innerHTML = '';
    
    // Close activity modal if open
    document.getElementById('activity-modal').style.display = 'none';
    
    document.getElementById('registration-modal').style.display = 'block';
}

function setupModalHandlers() {
    // Close modals when clicking on X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Handle registration form submission
    document.getElementById('registration-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const activityId = document.getElementById('activity-id').value;
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
        
        fetch(`/api/activities/${activityId}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage('registration-message', data.error, 'error');
            } else {
                showMessage('registration-message', 'Aanmelding succesvol! U ontvangt een bevestiging.', 'success');
                document.getElementById('registration-form').reset();
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    document.getElementById('registration-modal').style.display = 'none';
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error submitting registration:', error);
            showMessage('registration-message', 'Er is een fout opgetreden bij het aanmelden.', 'error');
        });
    });
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.innerHTML = `<div class="message ${type}">${message}</div>`;
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
