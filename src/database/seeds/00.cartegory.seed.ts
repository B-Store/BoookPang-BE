import fs from 'fs';
import csv from 'csv-parser';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import path from 'path';

export class CategorySeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const categoryRepository = dataSource.getRepository(CategoryEntity);
    const csvFilePath = path.join(__dirname, '../../../category.csv');

    return new Promise<void>((resolve, reject) => {
      const categories = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          categories.push(row);
        })
        .on('end', async () => {
          console.log('CSV file successfully processed');
          try {
            for (const row of categories) {
              const existingCategory = await categoryRepository.findOne({
                where: { CID: row['CID'] },
              });

              if (!existingCategory && row['몰'] !== '음반' && row['몰'] !== 'DVD') {
                const category = new CategoryEntity();
                category.CID = row['CID'];
                category.categoryName = row['카테고리명'];
                category.mall = row['몰'];
                category.depth1 = row['1Depth'];
                category.depth2 = row['2Depth'];
                category.depth3 = row['3Depth'];
                category.depth4 = row['4Depth'];
                category.depth5 = row['5Depth'];

                await categoryRepository.save(category);
              }
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
