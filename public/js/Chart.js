const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
        duration: 1200,          // অ্যানিমেশন কতক্ষণ চলবে (মিলিসেকেন্ড)
        easing: 'easeOutQuart',  // স্মুথ ইফেক্ট
        animateScale: true,      // স্কেল অ্যানিমেশন
        animateRotate: true      // রোটেট অ্যানিমেশন (pie/doughnut এর জন্য ভালো)
    },
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: `Expenses - ${getMonthName(selectedMonth)} ${selectedYear}`,
            font: {
                size: 16
            }
        },
        tooltip: {
            callbacks: {
                label: function(context) {
                    return '$ ' + context.raw.toLocaleString();
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value) {
                    return '$ ' + value;
                }
            }
        }
    }
};