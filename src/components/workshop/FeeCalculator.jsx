"use client";

export default function FeeCalculator({ formValues, feeSummary }) {
    const { baseFee, discount, accommodationFee, gst, finalAmount } = feeSummary;

    return (
        <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', color: '#334155' }}>2. Live Bill Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Selected Track:</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{formValues.workshop || 'None chosen yet'}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Base Workshop Fee</span>
                    <span>₹{baseFee}</span>
                </div>

                {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '500' }}>
                        <span>IITP Campus Discount</span>
                        <span>-₹{discount}</span>
                    </div>
                )}

                {formValues.isIITP === 'no' && accommodationFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
                        <span>Campus Housing Stay Fee</span>
                        <span>+₹{accommodationFee}</span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Statutory GST (18%)</span>
                    <span>₹{gst}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '2px dashed #cbd5e1', margin: '0.5rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                    <span>Total Payable Amount</span>
                    <span style={{ color: '#2563eb' }}>₹{finalAmount}</span>
                </div>
            </div>
        </div>
    );
}