import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { MessageSquare, Send, Phone, User } from 'lucide-react';
import { whatsappService } from '../services/whatsappService';
import { toast } from 'react-toastify';

const WhatsApp = () => {
  const [messageForm, setMessageForm] = useState({
    to: '',
    templateName: '',
    language: 'en',
    parameters: ''
  });

  const sendMessageMutation = useMutation(
    (data) => whatsappService.sendMessage(data),
    {
      onSuccess: () => {
        toast.success('WhatsApp message sent successfully!');
        setMessageForm({
          to: '',
          templateName: '',
          language: 'en',
          parameters: ''
        });
      },
      onError: (error) => {
        toast.error('Failed to send message: ' + (error.response?.data || error.message));
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessageMutation.mutate(messageForm);
  };

  const handleInputChange = (field, value) => {
    setMessageForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const templateExamples = [
    {
      name: 'payment_reminder',
      description: 'Payment reminder template',
      parameters: 'Member Name, Amount, Due Date',
      example: 'John Doe, 600, 2025-11-15'
    },
    {
      name: 'birthday_wishes',
      description: 'Birthday wishes template',
      parameters: 'Member Name, Age',
      example: 'Jane Smith, 25'
    },
    {
      name: 'membership_expiry',
      description: 'Membership expiry notification',
      parameters: 'Member Name, Expiry Date',
      example: 'Mike Johnson, 2025-12-01'
    },
    {
      name: 'welcome_message',
      description: 'Welcome new member',
      parameters: 'Member Name, Gym Name',
      example: 'Sarah Wilson, Rock Gym'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Notifications</h1>
        <p className="text-gray-600">Send WhatsApp messages to gym members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Form */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send WhatsApp Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={messageForm.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  placeholder="919876543210"
                  className="pl-10 input-field"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., 919876543210 for India)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                required
                value={messageForm.templateName}
                onChange={(e) => handleInputChange('templateName', e.target.value)}
                placeholder="payment_reminder"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={messageForm.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="en_US">English (US)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parameters
              </label>
              <textarea
                value={messageForm.parameters}
                onChange={(e) => handleInputChange('parameters', e.target.value)}
                placeholder="John Doe, 600, 2025-11-15"
                rows={3}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated values for template parameters
              </p>
            </div>

            <button
              type="submit"
              disabled={sendMessageMutation.isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendMessageMutation.isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Template Examples */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Template Examples</h3>
          <div className="space-y-4">
            {templateExamples.map((template, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setMessageForm(prev => ({
                    ...prev,
                    templateName: template.name,
                    parameters: template.example
                  }));
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Parameters: {template.parameters}</p>
                      <p className="text-xs text-gray-700 mt-1">Example: {template.example}</p>
                    </div>
                  </div>
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <User className="h-6 w-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Birthday Wishes</h4>
            <p className="text-sm text-gray-600">Send to today's birthdays</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MessageSquare className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Payment Reminders</h4>
            <p className="text-sm text-gray-600">Send to pending payments</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Phone className="h-6 w-6 text-yellow-600 mb-2" />
            <h4 className="font-medium text-gray-900">Inactive Members</h4>
            <p className="text-sm text-gray-600">Send to inactive members</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Custom Message</h4>
            <p className="text-sm text-gray-600">Send custom template</p>
          </button>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <MessageSquare className="h-6 w-6 text-blue-600 mt-1 mr-3" />
          <div>
            <h4 className="text-lg font-medium text-blue-900 mb-2">WhatsApp Configuration</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Using Meta WhatsApp Cloud API (v18.0)</p>
              <p>• Phone Number ID: 908597628499895</p>
              <p>• Templates must be pre-approved by Meta</p>
              <p>• Parameters are passed as comma-separated values</p>
              <p>• Messages are sent via Facebook Graph API</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Messages</h3>
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Message history will appear here</p>
          <p className="text-sm text-gray-400">Send your first message to see the history</p>
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;