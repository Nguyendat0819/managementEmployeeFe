import { BaseDto } from '@core';

export interface TemplateItem extends Partial<BaseDto> {
  id: string;
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
