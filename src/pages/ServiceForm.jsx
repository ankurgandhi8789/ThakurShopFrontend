import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useGeoLocation } from '../hooks/useGeoLocation.js';
import {
  BoltIcon, LocationIcon, CheckIcon, PhoneIcon,
  MapPinIcon, HomeIcon, ClipboardIcon
} from '../components/Icons.jsx';
import styles from './ServiceForm.module.css';

export default function ServiceForm() {
  const { submitRequest, addNotification } = useApp();
  const { location, geoError, geoLoading, getLocation } = useGeoLocation();

  const [form, setForm] = useState({
    name: '', phone: '', address: '', landmark: '', description: '',
  });
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!form.phone.trim())   errs.phone   = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid 10-digit number';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.description.trim()) errs.description = 'Please describe the problem';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await submitRequest({ ...form, location });
      setSubmitted(true);
    } catch {
      addNotification('Failed to submit. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.successWrap}>
        <div className={styles.successIcon}>
          <CheckIcon size={32} stroke="#fff" sw={2.5} />
        </div>
        <h2 className={styles.successTitle}>Request Submitted!</h2>
        <p className={styles.successSub}>
          Our team will contact you shortly at +91 {form.phone}.
        </p>
        <div className={styles.successCard}>
          <div className={styles.successRow}>
            <span className={styles.successLabel}>Name</span>
            <span className={styles.successValue}>{form.name}</span>
          </div>
          {form.description && (
            <div className={styles.successRow}>
              <span className={styles.successLabel}>Problem</span>
              <span className={styles.successValue}>{form.description}</span>
            </div>
          )}
          <div className={styles.successRow}>
            <span className={styles.successLabel}>Address</span>
            <span className={styles.successValue}>{form.address}</span>
          </div>
          {location && (
            <div className={styles.successRow}>
              <span className={styles.successLabel}>GPS</span>
              <span className={styles.successValue} style={{ color: 'var(--green)' }}>
                ✓ Location captured
              </span>
            </div>
          )}
        </div>
        <button className={styles.newReqBtn} onClick={() => {
          setForm({ name: '', phone: '', address: '', landmark: '', description: '' });
          setSubmitted(false);
        }}>
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <BoltIcon size={28} stroke="var(--gold)" />
        </div>
        <h1 className={styles.heroTitle}>Request a Service</h1>
        <p className={styles.heroSub}>Tell us your issue — our technician will visit your home and resolve it quickly.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>

        {/* Problem Description */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <ClipboardIcon size={12} stroke="var(--text-tertiary)" />
            Describe the problem *
          </label>
          <textarea
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            placeholder="e.g. AC is not cooling, fan making noise, washing machine not spinning..."
            value={form.description}
            onChange={set('description')}
            rows={3}
          />
          {errors.description && <span className={styles.errMsg}>{errors.description}</span>}
          <span className={styles.descHint}>
            The more detail you give, the better prepared our technician will be.
          </span>
        </div>

        {/* GPS */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <LocationIcon size={12} stroke="var(--text-tertiary)" />
            Auto-detect Location (GPS)
          </label>
          {location ? (
            <div className={styles.gpsSuccess}>
              <CheckIcon size={14} stroke="var(--green)" />
              <div>
                <div className={styles.gpsSuccessText}>Location captured!</div>
                <div className={styles.gpsCoords}>
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </div>
              </div>
            </div>
          ) : (
            <button type="button" className={styles.gpsBtn} onClick={getLocation} disabled={geoLoading}>
              <LocationIcon size={16} stroke={geoLoading ? 'var(--text-tertiary)' : 'var(--blue)'} />
              {geoLoading ? 'Detecting location…' : 'Detect My Location'}
            </button>
          )}
          {geoError && <span className={styles.errMsg}>{geoError}</span>}
          <span className={styles.gpsHint}>Helps our technician navigate to you faster</span>
        </div>

        {/* Phone */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <PhoneIcon size={12} stroke="var(--text-tertiary)" />
            Phone Number *
          </label>
          <input
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            type="tel"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={set('phone')}
            maxLength={10}
            inputMode="tel"
            autoComplete="tel"
          />
          {errors.phone && <span className={styles.errMsg}>{errors.phone}</span>}
        </div>

        {/* Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full Name *</label>
          <input
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            type="text"
            placeholder="e.g. Rajesh Sharma"
            value={form.name}
            onChange={set('name')}
            autoComplete="name"
          />
          {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
        </div>

        {/* Address */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <MapPinIcon size={12} stroke="var(--text-tertiary)" />
            Full Address *
          </label>
          <textarea
            className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
            placeholder="House/Flat no., Street, Area, City"
            value={form.address}
            onChange={set('address')}
            rows={3}
          />
          {errors.address && <span className={styles.errMsg}>{errors.address}</span>}
        </div>

        {/* Landmark */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <HomeIcon size={12} stroke="var(--text-tertiary)" />
            Nearby Landmark
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Near Metro Gate 2, Opp. School"
            value={form.landmark}
            onChange={set('landmark')}
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={submitting || geoLoading}>
          {geoLoading ? 'Detecting location…' : submitting ? 'Submitting…' : 'Submit Request'}
        </button>

        <p className={styles.footerNote}>
          We'll call you within 30 minutes to confirm your appointment.
        </p>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerName}>Vinod Thakur</div>
          <a href="tel:9268319213" className={styles.footerPhone}>📞 92683 19213</a>
          <div className={styles.footerCopy}>© {new Date().getFullYear()} Thakur Electronics. All rights reserved.</div>
        </div>
      </form>
    </div>
  );
}
