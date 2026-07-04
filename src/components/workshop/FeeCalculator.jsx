"use client";

export default function FeeCalculator({ formValues, feeSummary }) {
    const { baseFee, discount, accommodationFee, gst, finalAmount } = feeSummary;

    return (
        <div style={{ border: '1px solid rgba(14, 165, 233, 0.2)', padding: '1.75rem', borderRadius: '16px', backgroundColor: 'rgba(15, 23, 42, 0.5)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc' }}>
                2. Live Bill Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Selected Track:</span>
                    <span style={{ fontWeight: '600', color: '#e2e8f0', textAlign: 'right' }}>{formValues.workshop || 'None chosen yet'}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '0.5rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                    <span>Base Workshop Fee</span>
                    <span>₹{baseFee}</span>
                </div>

                {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontWeight: '500', animation: 'fadeIn 0.3s ease-out' }}>
                        <span>IITP Campus Discount</span>
                        <span>-₹{discount}</span>
                    </div>
                )}

                {formValues.isIITP === 'no' && accommodationFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', animation: 'fadeIn 0.3s ease-out' }}>
                        <span>Campus Housing Stay Fee</span>
                        <span>+₹{accommodationFee}</span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Statutory GST (18%)</span>
                    <span>₹{gst}</span>
                </div>

                <hr style={{ border: 'none', borderTop: '2px dashed #475569', margin: '0.75rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc' }}>Total Payable Amount</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0ea5e9', textShadow: '0 0 15px rgba(14, 165, 233, 0.4)' }}>
                        ₹{finalAmount}
                    </span>
                </div>
            </div>
        </div>
    );
}