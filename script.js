// This file contains the JavaScript code for controlling the functionality of the web page.

let map;
let markers = [];

function initMap(center = [139.767125, 35.681236], zoom = 12) {
    map = new maplibregl.Map({
        container: 'map', // マップを表示するコンテナID
        style: 'https://tile.openstreetmap.jp/styles/osm-bright/style.json', // スタイルURL
        center: center, // 初期中心座標
        zoom: zoom // 初期ズームレベル
    });

    // ナビゲーションコントロールを追加
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // 現在地を表示（マーカー追加部分を削除）
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            const lng = pos.coords.longitude;
            const lat = pos.coords.latitude;
            map.setCenter([lng, lat]); // 現在地に地図を移動
        }, function() {
            console.error('現在地を取得できませんでした');
        });
    }
}

// DOMContentLoaded イベントでマップを初期化
window.addEventListener('DOMContentLoaded', function() {
    initMap();
});

function showMap(place) {
    markers.forEach(m => m.remove());
    markers = [];
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`)
        .then(res => res.json())
        .then(data => {
            if (data && data[0]) {
                const lng = parseFloat(data[0].lon);
                const lat = parseFloat(data[0].lat);
                map.flyTo({ center: [lng, lat], zoom: 14 });
                const marker = new maplibregl.Marker({ color: "red" })
                    .setLngLat([lng, lat])
                    .setPopup(new maplibregl.Popup().setText(place))
                    .addTo(map);
                markers.push(marker);
            } else {
                alert('場所が見つかりませんでした');
            }
        });
}

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const place = document.getElementById('searchInput').value;
    if (place) {
        showMap(place);
    }
});

function updateSavedShelters() {
    const savedShelters = JSON.parse(localStorage.getItem('shelters')) || [];
    const container = document.getElementById('savedShelters');
    container.innerHTML = '';
    savedShelters.forEach((shelter, index) => {
        const div = document.createElement('div');
        div.className = 'alert alert-info alert-dismissible fade show mb-2';
        div.role = 'alert';
        div.innerHTML = `
            <span style="cursor:pointer;" class="shelter-link">${shelter}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="閉じる"></button>
        `;
        div.querySelector('.shelter-link').addEventListener('click', function() {
            showMap(shelter);
        });
        div.querySelector('.btn-close').addEventListener('click', function() {
            savedShelters.splice(index, 1);
            localStorage.setItem('shelters', JSON.stringify(savedShelters));
            updateSavedShelters();
        });
        container.appendChild(div);
    });
}

document.getElementById('shelterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const shelterInput = document.getElementById('shelterInput');
    const shelter = shelterInput.value.trim();
    if (shelter) {
        const savedShelters = JSON.parse(localStorage.getItem('shelters')) || [];
        savedShelters.push(shelter);
        localStorage.setItem('shelters', JSON.stringify(savedShelters));
        updateSavedShelters();
        shelterInput.value = '';
        const shelterModal = bootstrap.Modal.getInstance(document.getElementById('shelterModal'));
        shelterModal.hide();
        showMap(shelter);
    }
});

document.getElementById('shelterModal').addEventListener('show.bs.modal', updateSavedShelters);

function updatePhoneList() {
    const ul = document.getElementById('phoneList');
    ul.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'list-group-item bg-dark text-light d-flex justify-content-between align-items-center';
    li.innerHTML = `
        <span>サイトリンク</span>
        <div>
            <a href="https://aoisann.github.io/Aosa/01/" target="_blank" class="btn btn-sm btn-primary">
                サイトに飛ぶ
            </a>
        </div>
    `;
    ul.appendChild(li);
}

document.getElementById('phoneModal').addEventListener('show.bs.modal', function() {
    const phoneList = document.getElementById('phoneList');
    phoneList.innerHTML = `
        <li class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
            <span>サイトリンク</span>
            <a href="https://aoisann.github.io/Aosa/01/" target="_blank" class="btn btn-sm btn-primary">
                サイトに飛ぶ
            </a>
        </li>
    `;
});

const phoneMemo = document.getElementById('phoneMemo');
phoneMemo.value = localStorage.getItem('phoneMemo') || '';
phoneMemo.addEventListener('input', function() {
    localStorage.setItem('phoneMemo', phoneMemo.value);
});

function renderChecklist() {
    const checklist = JSON.parse(localStorage.getItem('checklist') || '[]');
    const ul = document.getElementById('checklist');
    ul.innerHTML = '';
    checklist.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item bg-dark text-light';
        li.innerHTML = `
            <input type="checkbox" class="form-check-input me-2" id="item${idx}">
            <span>${item.text}</span>
            <button type="button" class="btn btn-sm btn-danger ms-2 remove-checklist">削除</button>
        `;
        const cb = li.querySelector('input[type="checkbox"]');
        cb.checked = item.checked;
        cb.addEventListener('change', function() {
            checklist[idx].checked = cb.checked;
            localStorage.setItem('checklist', JSON.stringify(checklist));
        });
        li.querySelector('.remove-checklist').onclick = function() {
            checklist.splice(idx, 1);
            localStorage.setItem('checklist', JSON.stringify(checklist));
            renderChecklist();
        };
        ul.appendChild(li);
    });
}

window.addEventListener('DOMContentLoaded', renderChecklist);

document.getElementById('addChecklistForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('newChecklistItem');
    const text = input.value.trim();
    if (text) {
        const checklist = JSON.parse(localStorage.getItem('checklist') || '[]');
        checklist.push({ text, checked: false });
        localStorage.setItem('checklist', JSON.stringify(checklist));
        input.value = '';
        renderChecklist();
    }
});

const listMemo = document.getElementById('listMemo');
listMemo.value = localStorage.getItem('listMemo') || '';
listMemo.addEventListener('input', function() {
    localStorage.setItem('listMemo', listMemo.value);
});

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.style.background = '#fff';
        document.body.style.color = '#000';
        document.querySelectorAll('.bg-dark').forEach(e => e.classList.replace('bg-dark', 'bg-light'));
        document.querySelectorAll('.text-light').forEach(e => e.classList.replace('text-light', 'text-dark'));
        document.querySelectorAll('.modal-content').forEach(e => e.classList.replace('bg-dark', 'bg-light'));
        document.querySelectorAll('.form-control').forEach(e => {
            e.classList.remove('bg-dark', 'text-light');
            e.classList.add('bg-light', 'text-dark');
        });
        document.querySelectorAll('.nav-link').forEach(e => {
            e.classList.remove('text-light');
            e.classList.add('text-dark');
        });
        const brand = document.querySelector('.navbar-brand');
        if (brand) {
            brand.classList.remove('text-light');
            brand.classList.add('text-dark');
        }
    } else {
        document.body.style.background = '#000';
        document.body.style.color = '#fff';
        document.querySelectorAll('.bg-light').forEach(e => e.classList.replace('bg-light', 'bg-dark'));
        document.querySelectorAll('.text-dark').forEach(e => e.classList.replace('text-dark', 'text-light'));
        document.querySelectorAll('.modal-content').forEach(e => e.classList.replace('bg-light', 'bg-dark'));
        document.querySelectorAll('.form-control').forEach(e => {
            e.classList.remove('bg-light', 'text-dark');
            e.classList.add('bg-dark', 'text-light');
        });
        document.querySelectorAll('.nav-link').forEach(e => {
            e.classList.remove('text-dark');
            e.classList.add('text-light');
        });
        const brand = document.querySelector('.navbar-brand');
        if (brand) {
            brand.classList.remove('text-dark');
            brand.classList.add('text-light');
        }
    }
}

document.getElementById('settingsModal').addEventListener('show.bs.modal', function() {
    document.getElementById('themeSelect').value = localStorage.getItem('theme') || 'dark';
});

document.getElementById('themeSelect').addEventListener('change', function() {
    localStorage.setItem('theme', this.value);
    applyTheme(this.value);
});

window.addEventListener('DOMContentLoaded', function() {
    applyTheme(localStorage.getItem('theme') || 'dark');
});

function setLng(codes) {
    if (!Array.isArray(codes)) {
        console.error('codes is not an array:', codes);
        return;
    }
    codes.forEach(code => {
        // 言語コードに基づく処理を記述
        console.log('Processing language code:', code);
    });
}