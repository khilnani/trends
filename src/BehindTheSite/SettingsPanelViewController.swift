//
//  SettingsPanelViewController.swift
//  BehindTheSite
//
//  Created by Nik Khilnani on 2/17/15.
//  Copyright (c) 2015 Nik Khilnani. All rights reserved.
//

import Foundation
import UIKit

class SettingsPanelViewController : UIViewController {
    
    var delegate: CenterViewController?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
    }
    
    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func refreshView(centerViewController: CenterViewController) {
        println("refreshView: SettingsPanelViewController")
        delegate = centerViewController
        delegate!.displayItem()
    }
    
}