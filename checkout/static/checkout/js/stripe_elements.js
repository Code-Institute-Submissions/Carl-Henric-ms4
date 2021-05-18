
var stripePublicKey = $('#id_stripe_public_key').text().slice(1,-1);
var clientSecret = $('#id_client_secret').text().slice(1,-1);
var stripe = Stripe(stripePublicKey);
var elements = stripe.elements();
var card = elements.create('card', {style: style});
var style = {
    base: {
     color: '#000',
     fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
     fontSmoothing: 'antialiased',
     fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
    }
    },
    invalid: {
        color: '#dc3545',
        iconColor: '#dc3545'
    }
};
card.mount('#card-element');

// Handles realtime validation errors on card element 
card.addEventListener('change', function(event) {
    var errorDiv = document.getElementById('card-errors');
    if (event.error) {
        var html = `
        <span class="icon" role="alert">
            <i class="fas fa-times"></i>   
        </span>
        <span>${event.error.message}</span>`
        $(errorDiv).html(html);
    } else {
        errorDiv.textContent = '';
    }
});

// From Stripe, handle form submit (https://stripe.com/docs/payments/accept-a-payment?lang=html&platform=web&ui=elements)
var form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {
    ev.preventDefault();
    card.update({'disabled': true});
    $('#submit-button').attr('disabled', true);
    $('#payment-form').fadeToggle(100);
    $('#loading-overlay').fadeToggle(100);
    stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: card,
        }
    }).then(function (result) {
        if (result.error) {
            var errorDiv = document.getElementById('card-errors');
            var html = `
                <span class="icon" role="alert">
                <i class="fas fa-times"></i>   
                </span>
                <span>${result.error.message}</span>`;
            $(errorDiv).html(html);
            $('#payment-form').fadeToggle(100);
            $('#loading-overlay').fadeToggle(100);
            card.update({ 'disabled': false });
            $('#submit-button').attr('disabled', false);
        } else {
            // The payment has been processed!
            if (result.paymentIntent.status === 'succeeded') {
                form.submit();
            }
        }
    });
});