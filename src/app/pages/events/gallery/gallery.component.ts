import { Component } from '@angular/core';

interface GalleryItem {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  name: string;
  category: string;
  date: Date; // <-- Added date field
}
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent {
  // File type filter tabs
  types = ['All', 'image', 'video', 'audio', 'file'];

  // Category filter tabs
  categories = ['All', 'Katha', 'Peace', 'Bodh'];

  // Current selections
  selectedType = 'All';
  selectedCategory = 'All';
  selectedItem: GalleryItem | null = null;
  isPopupOpen = false;

  // Data with dates
  items: GalleryItem[] = [
    { type: 'image', url: 'assets/images/companies/adobe.svg', name: 'Image 1', category: 'Katha', date: new Date('2025-08-05') },
    { type: 'image', url: 'assets/images/companies/adobe-photoshop.svg', name: 'Image 2', category: 'Katha', date: new Date('2025-08-04') },
    { type: 'image', url: 'assets/images/companies/amazon.svg', name: 'Image 3', category: 'Katha', date: new Date('2025-07-25') },
    { type: 'image', url: 'assets/images/companies/flutter.svg', name: 'Image 4', category: 'Katha', date: new Date('2025-06-18') },
    { type: 'image', url: 'assets/images/companies/airbnb.svg', name: 'Image 5', category: 'Peace', date: new Date('2025-08-02') },
    { type: 'video', url: 'assets/gallery/video1.mp4', name: 'Video 1', category: 'Katha', date: new Date('2025-07-15') },
    { type: 'video', url: 'assets/gallery/video1.mp4', name: 'Video 2', category: 'Peace', date: new Date('2025-08-03') },
    { type: 'audio', url: 'assets/gallery/audio1.mp3', name: 'Audio 1', category: 'Bodh', date: new Date('2025-07-05') },
    { type: 'file', url: 'assets/gallery/doc1.pdf', name: 'Document 1', category: 'Katha', date: new Date('2025-06-01') },
  ];

  // Grouped and filtered items by Month-Year
  get filteredItemsByMonth() {
    const filtered = this.items.filter(item => {
      const matchType = this.selectedType === 'All' || item.type === this.selectedType;
      const matchCategory = this.selectedCategory === 'All' || item.category === this.selectedCategory;
      return matchType && matchCategory;
    });

    // Group by Month-Year
    const groups: { [key: string]: GalleryItem[] } = {};
    filtered.forEach(item => {
      const key = item.date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }

  // Month-Year keys sorted (latest first)
  getMonthYearKeys() {
    return Object.keys(this.filteredItemsByMonth)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  selectType(type: string) {
    this.selectedType = type;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  openPopup(item: GalleryItem) {
    this.selectedItem = item;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedItem = null;
  }
}
