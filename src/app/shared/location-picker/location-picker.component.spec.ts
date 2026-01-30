import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationPickerComponent } from './location-picker.component';
import { TranslateModule } from '@ngx-translate/core';

describe('LocationPickerComponent', () => {
  let component: LocationPickerComponent;
  let fixture: ComponentFixture<LocationPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationPickerComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
