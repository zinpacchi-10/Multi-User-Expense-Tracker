const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
        duration: 1200,          // অ্যানিমেশন কতক্ষণ চলবে (মিলিসেকেন্ড)
        easing: 'easeOutQuart',  // স্মুথ ইফেক্ট
        animateScale: true,      // স্কেল অ্যানিমেশন
        animateRotate: true      // রোটেট অ্যানিমেশন (pie/doughnut এর জন্য ভালো)
    },
    scales: {
    y: {
        ticks: {
            callback: function(value) {
                return getCurrency() + ' ' + value;
            }
        }
    }
},
plugins: {
    tooltip: {
        callbacks: {
            label: function(context) {
                return getCurrency() + ' ' + context.raw;
            }
        }
    }
}
};