export default function Confirmation({ registrationId, formData, feeSummary }) {
    return (
        <div style={{ animation: 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid #a7f3d0', padding: '2.5rem 2rem', borderRadius: '16px', backgroundColor: '#f0fdf4', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: '#d1fae5', borderRadius: '50%', color: '#10b981', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>✓</div>

            <h2 style={{ color: '#065f46', fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Registration Successful!</h2>
            <p style={{ color: '#047857', fontSize: '1rem', margin: '0 0 2rem 0' }}>A confirmation receipt has been emailed to <strong style={{ textDecoration: 'underline' }}>{formData.email}</strong>.</p>

            <div style={{ maxWidth: '450px', margin: '0 auto', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', textAlign: 'left' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', fontSize: '1rem', uppercase: 'true' }}>Official Pass Summary</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <div><span style={{ color: '#64748b' }}>Registration ID:</span> <strong style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#2563eb' }}>{registrationId}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Workshop Track:</span> <strong style={{ color: '#0f172a' }}>{formData.workshop}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Attendee:</span> <span style={{ color: '#334155', fontWeight: '500' }}>{formData.fullName}</span></div>
                    {formData.isIITP === 'yes' && <div><span style={{ color: '#64748b' }}>IITP Roll No:</span> <span style={{ fontFamily: 'monospace', color: '#334155' }}>{formData.rollNumber}</span></div>}
                    <div><span style={{ color: '#64748b' }}>Housing Allocation:</span> <span style={{ color: '#334155', fontWeight: '500' }}>{formData.requireAccommodation === 'yes' ? 'Campus Hostel Booked' : 'Not Requested'}</span></div>

                    <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '0.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem' }}>
                        <span style={{ color: '#0f172a' }}>Amount Processed:</span>
                        <span style={{ color: '#16a34a' }}>₹{feeSummary.finalAmount}</span>
                    </div>
                </div>
            </div>

            <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', background: 'none', border: 'none', color: '#059669', textDecoration: 'underline', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' }}>
                Register another attendee
            </button>
        </div>
    );
}