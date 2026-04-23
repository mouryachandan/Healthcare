import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Doctor } from '../models/Doctor.js';

export async function createOrder(req, res, next) {
  try {
    const { doctorId, appointmentId, amount } = req.body;
    if (!doctorId || !amount)
      return res.status(400).json({ message: 'doctorId and amount required' });
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) {
      const payment = await Payment.create({
        userId: req.user._id,
        doctorId,
        appointmentId,
        amount: Number(amount),
        status: 'created',
        paymentMethod: 'manual',
      });
      return res.json({
        mock: true,
        message: 'Razorpay not configured — payment record created only',
        payment,
      });
    }
    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({ key_id: key, key_secret: secret });
    const order = await rzp.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt: `appt_${appointmentId || Date.now()}`,
    });
    const payment = await Payment.create({
      userId: req.user._id,
      doctorId,
      appointmentId,
      amount: Number(amount),
      status: 'created',
      razorpayOrderId: order.id,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, paymentId: payment._id, keyId: key });
  } catch (e) {
    next(e);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      if (paymentId) {
        await Payment.findByIdAndUpdate(paymentId, { status: 'paid' });
        return res.json({ verified: true, mock: true });
      }
      return res.status(400).json({ message: 'Missing payment data' });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    if (expected !== razorpay_signature)
      return res.status(400).json({ message: 'Invalid signature' });
    const pay = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );
    res.json({ verified: true, payment: pay });
  } catch (e) {
    next(e);
  }
}
