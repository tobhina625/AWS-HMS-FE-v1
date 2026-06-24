<script setup lang="ts">
  import { ref, watch } from 'vue';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';

  interface Props {
    show: boolean;
    latitude?: number | null;
    longitude?: number | null;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['close', 'update:location']);

  const mapRef = ref<HTMLDivElement | null>(null);
  const map = ref<google.maps.Map | null>(null);
  const marker = ref<google.maps.Marker | null>(null);
  const selectedLat = ref<number>(props.latitude || 31.5204);
  const selectedLng = ref<number>(props.longitude || 74.3587);
  const searchInput = ref<HTMLInputElement | null>(null);
  const isGoogleMapsLoaded = ref(false);
  const googleMapsError = ref<string | null>(null);

  const loadGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        isGoogleMapsLoaded.value = true;
        resolve();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        googleMapsError.value = 'Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.';
        reject(new Error('API key not configured'));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        isGoogleMapsLoaded.value = true;
        resolve();
      };

      script.onerror = () => {
        googleMapsError.value = 'Failed to load Google Maps. Please check your API key and internet connection.';
        reject(new Error('Failed to load Google Maps'));
      };

      document.head.appendChild(script);
    });
  };

  const initMap = async () => {
    if (!mapRef.value || map.value) return;

    try {
      await loadGoogleMaps();
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      return;
    }

    const center = {
      lat: selectedLat.value,
      lng: selectedLng.value,
    };

    map.value = new google.maps.Map(mapRef.value, {
      center,
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    marker.value = new google.maps.Marker({
      position: center,
      map: map.value,
      draggable: true,
      title: 'Branch Location',
    });

    map.value.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateMarkerPosition(lat, lng);
      }
    });

    marker.value.addListener('dragend', () => {
      if (marker.value) {
        const position = marker.value.getPosition();
        if (position) {
          updateMarkerPosition(position.lat(), position.lng());
        }
      }
    });

    if (searchInput.value) {
      const autocomplete = new google.maps.places.Autocomplete(searchInput.value);
      autocomplete.bindTo('bounds', map.value);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        updateMarkerPosition(lat, lng);
        map.value?.setCenter({ lat, lng });
        map.value?.setZoom(15);
      });
    }
  };

  const updateMarkerPosition = (lat: number, lng: number) => {
    selectedLat.value = lat;
    selectedLng.value = lng;
    marker.value?.setPosition({ lat, lng });
  };

  const handleSave = () => {
    emit('update:location', {
      latitude: selectedLat.value,
      longitude: selectedLng.value,
    });
    emit('close');
  };

  watch(
    () => props.show,
    (newVal) => {
      if (newVal) {
        setTimeout(() => {
          initMap();
        }, 100);
      }
    }
  );

  watch([() => props.latitude, () => props.longitude], ([newLat, newLng]) => {
    if (newLat && newLng) {
      selectedLat.value = newLat;
      selectedLng.value = newLng;
      if (map.value && marker.value) {
        const newPos = { lat: newLat, lng: newLng };
        map.value.setCenter(newPos);
        marker.value.setPosition(newPos);
      }
    }
  });
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" title="Select Location" size="xl">
    <div class="space-y-4">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-foreground">Search Location</label>
        <input
          ref="searchInput"
          type="text"
          placeholder="Search for a location..."
          class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent px-4 py-3 text-sm outline-none focus:border-primary dark:focus:border-primary text-emphasis"
        />
      </div>

      <div v-if="googleMapsError" class="w-full h-[500px] rounded-lg border border-stroke dark:border-strokedark overflow-hidden flex items-center justify-center bg-muted/10">
        <div class="text-center p-8 max-w-md">
          <svg class="w-16 h-16 mx-auto mb-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p class="text-sm text-foreground font-medium mb-2">{{ googleMapsError }}</p>
          <p class="text-xs text-muted">You can still enter coordinates manually below.</p>
        </div>
      </div>
      <div v-else ref="mapRef" class="w-full h-[500px] rounded-lg border border-stroke dark:border-strokedark overflow-hidden"></div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground block mb-2">Latitude</label>
          <input
            v-model.number="selectedLat"
            type="number"
            step="0.000001"
            class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent px-4 py-3 text-sm outline-none focus:border-primary dark:focus:border-primary text-emphasis"
            @input="updateMarkerPosition(selectedLat, selectedLng)"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground block mb-2">Longitude</label>
          <input
            v-model.number="selectedLng"
            type="number"
            step="0.000001"
            class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent px-4 py-3 text-sm outline-none focus:border-primary dark:focus:border-primary text-emphasis"
            @input="updateMarkerPosition(selectedLat, selectedLng)"
          />
        </div>
      </div>

      <p class="text-xs text-muted italic">Click on the map or drag the marker to select a location</p>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="primary" @click="handleSave">Save Location</BaseButton>
    </template>
  </BaseModal>
</template>
