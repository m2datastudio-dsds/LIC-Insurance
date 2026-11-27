import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bath, BedDouble, Building2, Download, MapPin, Maximize2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import api from '../services/api';

const escapeXml = (value = '') => String(value).replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[character]));
const wrap = (value, limit = 54) => String(value || '').split(/\s+/).filter(Boolean).reduce((lines, word) => { const last = lines.at(-1); if (!last || `${last} ${word}`.length > limit) lines.push(word); else lines[lines.length - 1] = `${last} ${word}`; return lines; }, []);

export default function PropertyDownloadPage() {
  const { id } = useParams();
  const location = useLocation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const fromAdmin = new URLSearchParams(location.search).get('from') === 'admin';
  const backTo = fromAdmin ? '/admin/real-estate' : `/real-estate/${id}`;
  useEffect(() => { api.get(`/properties/${id}`).then((response) => setProperty(response.data.data)).catch(() => setProperty(null)).finally(() => setLoading(false)); }, [id]);
  const price = useMemo(() => property ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(property.price)) : '', [property]);

  const downloadCard = () => {
    const description = wrap(property.description || 'Contact us for complete property details.', 72).slice(0, 5);
    const amenities = (property.amenities || []).slice(0, 8).join(' • ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760"><rect width="1200" height="760" fill="#f4f7f5"/><rect width="1200" height="150" fill="#173f39"/><text x="70" y="66" fill="#ddc98d" font-family="Arial" font-size="22" font-weight="700">PROPERTY DETAILS</text><text x="70" y="112" fill="white" font-family="Georgia" font-size="38" font-weight="700">${escapeXml(property.title)}</text><rect x="70" y="190" width="1060" height="500" rx="24" fill="white" stroke="#dbe3df"/><text x="115" y="250" fill="#8a6d21" font-family="Arial" font-size="20" font-weight="700">${escapeXml(property.propertyType)} · ${property.listingType === 'SALE' ? 'FOR SALE' : 'FOR RENT'}</text><text x="115" y="305" fill="#173f39" font-family="Arial" font-size="40" font-weight="700">${escapeXml(price)}</text><text x="115" y="350" fill="#52645e" font-family="Arial" font-size="22">Location: ${escapeXml(property.address || property.location)}</text><text x="115" y="395" fill="#52645e" font-family="Arial" font-size="21">${property.bedrooms ?? '—'} Bedrooms     ${property.bathrooms ?? '—'} Bathrooms     ${property.area ?? '—'} ${escapeXml(property.areaUnit || '')}</text><line x1="115" y1="425" x2="1085" y2="425" stroke="#dfe5e1"/><text x="115" y="468" fill="#173f39" font-family="Arial" font-size="23" font-weight="700">About this property</text>${description.map((line, index) => `<text x="115" y="${505 + index * 28}" fill="#52645e" font-family="Arial" font-size="19">${escapeXml(line)}</text>`).join('')}${amenities ? `<text x="115" y="650" fill="#173f39" font-family="Arial" font-size="18" font-weight="700">Amenities: ${escapeXml(amenities)}</text>` : ''}<text x="1085" y="650" text-anchor="end" fill="#2f7650" font-family="Arial" font-size="18" font-weight="700">${escapeXml(property.status)}</text><text x="70" y="730" fill="#64756f" font-family="Arial" font-size="17">Contact: ${escapeXml(property.contactName || 'Property Agent')} ${escapeXml(property.contactPhone || '')}</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-property-card.svg`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  };

  if (loading) return <div className="page-shell property-download-page">Loading property…</div>;
  if (!property) return <div className="page-shell property-download-page"><h1>Property not found</h1><Link to={backTo}>Go back</Link></div>;
  return <div className="page-shell property-download-page"><Link className="admin-back-link" to={backTo}><ArrowLeft size={17}/> Back</Link><header className="download-page-header"><div><span className="eyebrow">Property card</span><h1>Review and download</h1><p>Check the property details below, then use the download button to save the card.</p></div><button className="btn btn-primary" onClick={downloadCard}><Download size={18}/> Download Property Card</button></header><article className="download-property-card"><div className="download-card-banner"><Building2 size={34}/><span>{property.propertyType} · {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}</span></div><div className="download-card-body"><div className="download-card-title"><div><h2>{property.title}</h2><p><MapPin size={17}/>{property.address || property.location}</p></div><strong>{price}</strong></div><div className="download-card-facts"><span><BedDouble/> <b>{property.bedrooms ?? '—'}</b> Bedrooms</span><span><Bath/> <b>{property.bathrooms ?? '—'}</b> Bathrooms</span><span><Maximize2/> <b>{property.area ?? '—'}</b> {property.areaUnit}</span></div><h3>About this property</h3><p className="property-description">{property.description || 'Contact us for complete property details.'}</p>{property.amenities?.length > 0 && <><h3>Amenities</h3><div className="amenities-grid">{property.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}</div></>}<div className="download-card-contact"><span>Status: <b>{property.status}</b></span><span>Contact: <b>{property.contactName || 'Property Agent'} {property.contactPhone || ''}</b></span></div></div></article></div>;
}
