"use client";

export default function RegistrationForm({ register, errors, watch }) {
    // Watch these to trigger UI changes instantly
    const isIITP = watch("isIITP");
    const emailValue = watch("email");
    const mobileValue = watch("mobile");

    // Recreating your green tick logic based on zod errors + presence of value
    const isEmailValid = emailValue && !errors.email;
    const isMobileValid = mobileValue && !errors.mobile;

    return (
        <div style={{ border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>1. Personal & Academic Details</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>Full Name *</label>
                    <input type="text" {...register("fullName")} placeholder="Name" style={{ width: '100%', padding: '0.6rem', border: `1px solid ${errors.fullName ? '#dc2626' : '#cbd5e1'}`, borderRadius: '6px', boxSizing: 'border-box' }} />
                    {errors.fullName && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.fullName.message}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Email Address * {isEmailValid ? <span style={{ color: '#16a34a' }}>✓</span> : errors.email && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>({errors.email.message})</span>}
                        </label>
                        <input type="email" {...register("email")} placeholder="xyz@iitp.ac.in" style={{ width: '100%', padding: '0.6rem', border: `1px solid ${errors.email ? '#dc2626' : (isEmailValid ? '#16a34a' : '#cbd5e1')}`, borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                            Mobile Number * {isMobileValid ? <span style={{ color: '#16a34a' }}>✓</span> : errors.mobile && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>({errors.mobile.message})</span>}
                        </label>
                        <input type="text" {...register("mobile")} placeholder="9876543210" style={{ width: '100%', padding: '0.6rem', border: `1px solid ${errors.mobile ? '#dc2626' : (isMobileValid ? '#16a34a' : '#cbd5e1')}`, borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>Institute / College *</label>
                        <input type="text" {...register("college")} placeholder="IIT Patna" style={{ width: '100%', padding: '0.6rem', border: `1px solid ${errors.college ? '#dc2626' : '#cbd5e1'}`, borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>City / State *</label>
                        <input type="text" {...register("cityState")} placeholder="Patna, Bihar" style={{ width: '100%', padding: '0.6rem', border: `1px solid ${errors.cityState ? '#dc2626' : '#cbd5e1'}`, borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>Workshop Applying For *</label>
                    <select {...register("workshop")} style={{ width: '100%', padding: '0.6rem', border: `1px solid ${errors.workshop ? '#dc2626' : '#cbd5e1'}`, borderRadius: '6px', backgroundColor: '#fff' }}>
                        <option value="">-- Choose a Technology track --</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Ethical Hacking">Ethical Hacking</option>
                        <option value="Drone Technology">Drone Technology</option>
                        <option value="Full Stack Development">Full Stack Development</option>
                        <option value="Arduino Course">Arduino Course</option>
                        <option value="Autonomous Robotics">Autonomous Robotics</option>
                        <option value="Generative AI">Generative AI</option>
                        <option value="Internet of Things">Internet of Things</option>
                    </select>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>Are you an IIT Patna Student? *</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: isIITP === 'yes' ? '0.75rem' : '0' }}>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input type="radio" value="yes" {...register("isIITP")} /> Yes, I am
                        </label>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input type="radio" value="no" {...register("isIITP")} /> No, another college
                        </label>
                    </div>

                    {isIITP === 'yes' && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '600', fontSize: '0.85rem', color: '#1e3a8a' }}>Roll Number *</label>
                            <input type="text" {...register("rollNumber")} placeholder="e.g., 2501es09" style={{ width: '100%', padding: '0.5rem', border: `1px solid ${errors.rollNumber ? '#dc2626' : '#3b82f6'}`, borderRadius: '6px', boxSizing: 'border-box', backgroundColor: '#fff' }} />
                            {errors.rollNumber && <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>{errors.rollNumber.message}</span>}
                        </div>
                    )}
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '700', fontSize: '0.9rem' }}>Accommodation</label>
                    {isIITP === 'no' ? (
                        <div style={{ padding: '0.5rem 0' }}>
                            <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Do you require accommodation on campus? (+₹500)</span>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <label style={{ cursor: 'pointer' }}><input type="radio" value="yes" {...register("requireAccommodation")} /> Yes</label>
                                <label style={{ cursor: 'pointer' }}><input type="radio" value="no" {...register("requireAccommodation")} /> No</label>
                            </div>
                        </div>
                    ) : isIITP === 'yes' ? (
                        <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#1e40af', fontSize: '0.85rem', fontWeight: '500' }}>
                            ℹ Not Required (IIT Patna students receive automatic campus access)
                        </div>
                    ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Please specify IIT Patna status to check housing configurations.</span>
                    )}
                </div>
            </div>
        </div>
    );
}